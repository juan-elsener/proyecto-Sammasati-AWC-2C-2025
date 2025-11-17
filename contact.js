import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const TABLE_NAME = "ContactMessages";

const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json"
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form");
    const submitButton = form.querySelector(".btn-submit");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Dar feedback de "Cargando"
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = "Enviando...";
        submitButton.disabled = true; // Evita doble click

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        const fields = { Name: name, Email: email, Message: message };

        try {
            const res = await fetch(airtableUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({ fields })
            });

            if (!res.ok) throw new Error("Error al enviar mensaje");

            
            form.reset();
            submitButton.textContent = "¡Enviado con éxito!";

            // Vuelve al estado original después de 2 seg
            setTimeout(() => {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }, 2000);

        } catch (err) {
            console.error(err);

            // Feedback de ERROR
            submitButton.textContent = "Error, intenta de nuevo";
            submitButton.disabled = false; 
        }
    });
});