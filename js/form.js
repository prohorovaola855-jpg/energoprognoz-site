(() => {
    "use strict";

    function initContact() {
        const dialog = document.getElementById("contact-dialog");
        const form = document.getElementById("contact-form");

        if (!dialog || !form) return;

        const title = document.getElementById("contact-form-title");
        const description = document.getElementById(
            "contact-form-description"
        );

        const company = document.getElementById("contact-company-field");
        const contract = document.getElementById("contact-contract-field");
        const status = form.querySelector(".contact-status");
        const submit = form.querySelector(".contact-submit");
        const attachment = form.querySelector('[name="attachment"]');

        let opener = null;

        const topics = {
            "new-client": {
                title: "Обсудим сотрудничество",
                description: "Расскажите о вашей организации и задаче.",
                company: true,
                contract: false
            },
            "existing-client": {
                title: "Поможем с вашим вопросом",
                description: "Укажите организацию и опишите обращение.",
                company: true,
                contract: true
            },
            "other": {
                title: "Напишите нам",
                description: "Оставьте сообщение и контакты для ответа.",
                company: false,
                contract: false
            }
        };

        function updateTopic() {
            const selected = form.querySelector(
                '[name="topic"]:checked'
            );

            const settings = topics[selected.value];

            title.textContent = settings.title;
            description.textContent = settings.description;

            company.hidden = !settings.company;
            company.querySelector("input").disabled = !settings.company;

            contract.hidden = !settings.contract;
            contract.querySelector("input").disabled = !settings.contract;
        }

        document.querySelectorAll(
            ".contact-button, .hero-button, .service-button, " +
            ".business-contact-button, [data-open-contact]"
        ).forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                opener = button;
                status.textContent = "";

                if (!dialog.open) dialog.showModal();
            });
        });

        dialog.querySelector(".contact-close").addEventListener(
            "click",
            () => dialog.close()
        );

        dialog.addEventListener("close", () => opener?.focus());

        dialog.addEventListener("click", (event) => {
            if (event.target !== dialog) return;

            const rect = dialog.getBoundingClientRect();

            if (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            ) {
                dialog.close();
            }
        });

        form.querySelectorAll('[name="topic"]').forEach((input) => {
            input.addEventListener("change", updateTopic);
        });

        // Вложения — не более 10 МБ.
        attachment.addEventListener("change", () => {
            const file = attachment.files[0];

            attachment.setCustomValidity(
                file && file.size > 10 * 1024 * 1024
                    ? "Выберите файл размером не более 10 МБ."
                    : ""
            );

            attachment.reportValidity();
        });

        // Отправку выполняет сама HTML-форма.
        // Здесь больше нет блокировки или перехвата через fetch.
        submit.disabled = false;

        updateTopic();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initContact,
            { once: true }
        );
    } else {
        initContact();
    }
})();