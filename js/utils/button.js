
export function handleBackBtn() {
    
    const backBtn = document.querySelectorAll(".backBtn");
backBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        window.history.back();
    })
})
}