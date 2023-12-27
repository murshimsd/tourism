const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User = require('./userModel');
const { promises } = require("nodemailer/lib/xoauth2");

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "a tour name shouldnt have more than 40 letters"],
      minlength: [5, "a tour name should  more than 5 letters"],
      // validate:[validator.isAlpha,'only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "must need show duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "must add group size"],
    },
    difficulty: {
      type: String,
      required: [true, "should show difficulties"],
      enum: {
        values: ["easy", "medium", "difficult"],
        massage: "diffficusty must one of easy , medium , difficult",
      },
    },
    price: {
      type: Number,
      required: [true, "must show the price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, "rating should belove 5.0"],
      min: [1, "rating should above 1.0"],
      set:val=>Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDisount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, "should specify summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "should specify cover Image"],
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides:[{
      type:mongoose.Schema.ObjectId,
      ref:'User'
    }]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// tourSchema.index({price:1})
// tourSchema.index({price:1,ratingsAverage:-1})
// tourSchema.index({slug:1})
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Reviews',
  foreignField: 'tour',
  localField: '_id'
});


// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
///can have multiple pre-middleware .
//  can have post and pre middle wares only for save,create

// tourSchema.pre('save', function(next) {
//   console.log("savedddddddddd")
//   next()
// });

// tourSchema.post('save',function(doc,next){
//     console.log(doc)
//     next()
// })

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//QUERY MIDDLEWARE . THIS MIDDLEWWARES WORKS ON QUERY NOT DOCUMENTS LIKE BEFORE
tourSchema.pre(/^find/, function (next) {
  // this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

//AGGREGATION MIDDLEWARE .
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
