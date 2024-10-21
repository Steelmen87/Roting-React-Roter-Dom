import {deleteContact} from "../contacts.js";
import {redirect} from "react-router-dom";

export async function action({ params }) {
    await deleteContact(params.contactId);
    return redirect("/");
}