import { toastMsg } from "../components/toast.js";
import { supabase } from "../supabase.js";
import { closeModal } from "https://scybud.github.io/scybud-ui/js/utils/modal.js";
import { setButtonLoading } from "../utils/button.js";
import { sessionReady, sessionState } from "../session.js";


export async function handleContentReport( content, contentUrl, contentUrlId, userNameId, reasonId, reportDetailsId, reportBtnId) {
    await sessionReady;

   const user = await sessionState.profile;

    const contentUrlEl = document.getElementById(contentUrlId);
    const userNameEl = document.getElementById(userNameId);
    const reasonEl = document.getElementById(reasonId);
    const reportDetailsEl = document.getElementById(reportDetailsId);
    const reportBtnEl = document.getElementById(reportBtnId);
    const userId = user?.id || null;


if(!contentUrlEl || !userNameEl || !reasonEl || !reportDetailsEl || !reportBtnEl) return;

contentUrlEl.value = contentUrl;
userNameEl.value = user?.username || "Guest";


reportBtnEl.addEventListener("click", async () => {
    const reasonValue = reasonEl.value;
    const reportDetailValue = reportDetailsEl.value;

if(!reasonValue || !reportDetailValue) return toastMsg("Please fill all field marked requried", "error");

 setButtonLoading(reportBtnEl, true);

 try {

     const {data, error} = await supabase.from("content_reports").insert({
        reporter_username: user?.username || "Guest",
        reporter_user_id: user?.id || null,
        content_url: contentUrl,
        target_type: "Artwork",
        target_id: content.id,
        reason: reasonValue,
        details: reportDetailValue
    });
    
    if(error) throw error;
    
    toastMsg("Content reported successfully! We will review and take aproppriate actions when necessary", "success");

    reasonEl.value = "";
    reportDetailsEl.value = "";

     closeModal();
} catch(error) {
    
        toastMsg("Error reporting content", "error");
        console.error(error);
    } finally {
        
        setButtonLoading(reportBtnEl, false);
}
});
}


export async function  handleContentDelete(contentId, contentTable, initDeleteBtn, confirmMsg) {

initDeleteBtn.addEventListener("click", () => {
    const modal = document.createElement("div")
    modal.classList.add("modal-container");
modal.innerHTML = `
  <div id="confirmActionModal" class="confirmActionModal card">
    <p class="modalMessage">${confirmMsg}</p>

    <div class="modalActions">
  <button type="button" class="btn cancel-btn">Cancel</button>
    <button type="button" class="btn danger deleteContent">Yes, delete</button>
    </div>
  </div>
`;

    const container = document.getElementById("modalContainer");
    container.appendChild(modal);

    const cancelBtn = modal.querySelector(".cancel-btn")
    cancelBtn.addEventListener("click", () => {
        closeModal();
    });
    
    const deleteContentBtn = modal.querySelector(".deleteContent");

    if(!deleteContentBtn) return console.log("Btn not found");

    deleteContentBtn.addEventListener("click", async () => {
        await deleteContent(contentId, contentTable);
    })
});
}

async function deleteContent(contentId, contentTable) {
        await sessionReady;

        const user = await sessionState?.profile;

        try {
            const {data, error} = await supabase.from(contentTable).delete().eq("id", contentId).eq("user_id", user.id);
            
            if(error) throw error;

            toastMsg("content deleted", "success");
            closeModal();
        } catch(error) {
            toastMsg("Failed to delete", "error")
            console.error(error);
        } 
}