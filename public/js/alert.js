

export const hideAlert = ()=>{
    const el = document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el)
}

export const showAlert = (type,msg) =>{
    hideAlert()
    const marKUp = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',marKUp)
    window.setTimeout(hideAlert,5000)

}