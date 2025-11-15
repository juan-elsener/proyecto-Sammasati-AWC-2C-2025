import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const TABLE_NAME = "ContactMessages";

const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json"
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    const fields = {
      Name: name,
      Email: email,
      Message: message
    };

    try {
      const res = await fetch(airtableUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ fields })
      });

      if (!res.ok) throw new Error("Error al enviar mensaje");

      form.reset();

    } catch (err) {
      console.error(err);
     
    }
  });
});