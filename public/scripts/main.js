// function postAdding(){
//     let showMode = document.getElementsByClassName("add-event-form")
//     if(showMode.style.display == "none"){
//         showMode.style.display = "block";
//     }else{
//         showMode.style.display = "none";
//     }
// }
document.querySelector(".trial").addEventListener("click", () => {
  console.log("button clicked");
  document.querySelector(".add-event-form").classList.toggle(".hide");
});
