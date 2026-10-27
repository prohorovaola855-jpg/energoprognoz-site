function initContactForm() {
    const dialog = document.getElementById("contact-dialog");
    const form = document.getElementById("contact-form");

    if (!dialog || !form) return;

    const submit = form.querySelector('[type="submit"]');
    const status = form.querySelector(".contact-status");
    const title = document.getElementById("contact-form-title");
    const description = document.getElementById("contact-form-description");
    const company = document.getElementById("contact-company-field");
    const contract = document.getElementById("contact-contract-field");

    let previousFocus;
    let sending = false;

    const topics = {
        "new-client": {
            title: "Обсудим сотрудничество",
            description: "Расскажите о вашей организации и задаче.",
            label: "Стать клиентом",
            company: true,
            contract: false
        },

        "existing-client": {
            title: "Поможем с вашим вопросом",
            description: "Укажите номер договора, если он есть.",
            label: "Я уже клиент",
            company: true,
            contract: true
        },

        "other": {
            title: "Напишите нам",
            description: "Оставьте ваш вопрос или предложение.",
            label: "Другой вопрос",
            company: false,
            contract: false
        }
    };

    function toggleField(field, visible) {
        if (!field) return;

        field.hidden = !visible;

        field.querySelectorAll("input").forEach(input => {
            input.disabled = !visible;
        });
    }

    function updateTopic() {
        const selected = form.querySelector('[name="topic"]:checked');
        const settings = topics[selected?.value] || topics["new-client"];

        if (title) title.textContent = settings.title;
        if (description) description.textContent = settings.description;

        toggleField(company, settings.company);
        toggleField(contract, settings.contract);
    }

    form.querySelectorAll('[name="topic"]').forEach(input => {
        input.addEventListener("change", updateTopic);
    });

    document.querySelectorAll(
        ".contact-button, .hero-button, .service-button, " +
        ".business-contact-button, [data-open-contact]"
    ).forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            previousFocus = document.activeElement;

            if (!dialog.open) dialog.showModal();
        });
    });

    dialog.querySelector(".contact-close")?.addEventListener("click", () => {
        dialog.close();
    });

    dialog.addEventListener("click", event => {
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

    dialog.addEventListener("close", () => {
        previousFocus?.focus();
    });

    /* Пока подключаем отправку только текстовых данных. */
    const attachment = form.querySelector('[name="attachment"]');

    if (attachment) {
        attachment.disabled = true;

        const attachmentBlock = attachment.closest(".contact-attachment");
        if (attachmentBlock) attachmentBlock.hidden = true;
    }

    /* Удаляем настройки предыдущего сервиса. */
    form.querySelectorAll(
        '[name="_subject"], [name="_template"], ' +
        '[name="_next"], [name="_captcha"]'
    ).forEach(input => input.remove());

    form.action = "https://formspree.io/f/xdeegbkb";
    form.method = "POST";

    if (submit) submit.disabled = false;
    updateTopic();

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (sending || !form.reportValidity()) return;

        sending = true;

        if (submit) {
            submit.disabled = true;
            submit.textContent = "Отправляем…";
        }

        if (status) status.textContent = "Отправляем обращение…";

        const data = new FormData(form);
        const selected = form.querySelector('[name="topic"]:checked');

        data.set(
            "topic",
            topics[selected?.value]?.label || "Обращение с сайта"
        );

        data.delete("attachment");

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: data,
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Сервис не принял обращение");
            }

            form.reset();
            updateTopic();

            if (status) {
                status.textContent =
                    "Обращение принято! Мы свяжемся с вами " +
                    "по указанным контактам.";
            }
        } catch {
            if (status) {
                status.textContent =
                    "Не удалось отправить обращение. " +
                    "Проверьте интернет и попробуйте ещё раз. " +
                    "Введённые данные сохранены.";
            }
        } finally {
            sending = false;

            if (submit) {
                submit.disabled = false;
                submit.textContent = "Отправить";
            }
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactForm);
} else {
    initContactForm();
}