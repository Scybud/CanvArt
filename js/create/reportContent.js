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


