(() => {
    "use strict";

    function initDisclosure() {
        const layout = document.getElementById("disclosure-layout");
        const content = document.getElementById("disclosure-content");
        const backButton = document.getElementById("disclosure-back");

        if (!layout || !content || !backButton) return;

        const menuButtons = [
            ...layout.querySelectorAll(".disclosure-menu-button")
        ];

        const panels = [
            ...content.querySelectorAll(".disclosure-panel")
        ];

        let lastSelectedButton = null;

        function openSection(button) {
            const panelId = button.getAttribute("aria-controls");
            const selectedPanel = panels.find(
                (panel) => panel.id === panelId
            );

            if (!selectedPanel) return;

            lastSelectedButton = button;

            menuButtons.forEach((menuButton) => {
                const isActive = menuButton === button;

                menuButton.classList.toggle("is-active", isActive);
                menuButton.setAttribute(
                    "aria-expanded",
                    String(isActive)
                );

                if (isActive) {
                    menuButton.setAttribute("aria-current", "true");
                } else {
                    menuButton.removeAttribute("aria-current");
                }
            });

            panels.forEach((panel) => {
                const isActive = panel === selectedPanel;

                panel.hidden = !isActive;
                panel.classList.toggle("is-active", isActive);
            });

            content.hidden = false;
            backButton.hidden = false;
            layout.classList.add("is-open");

            // Переводим фокус на заголовок открытого раздела.
            const heading = selectedPanel.querySelector(
                ".disclosure-panel-title"
            );

            if (heading) {
                heading.focus({ preventScroll: true });

                heading.scrollIntoView({
                    behavior: "auto",
                    block: "nearest"
                });
            }
        }

        function showAllSections() {
            // Возвращаем фокус до скрытия содержимого.
            if (lastSelectedButton) {
                lastSelectedButton.focus({ preventScroll: true });
            }

            layout.classList.remove("is-open");

            menuButtons.forEach((button) => {
                button.classList.remove("is-active");
                button.setAttribute("aria-expanded", "false");
                button.removeAttribute("aria-current");
            });

            panels.forEach((panel) => {
                panel.hidden = true;
                panel.classList.remove("is-active");
            });

            content.hidden = true;
            backButton.hidden = true;

            if (lastSelectedButton) {
                lastSelectedButton.scrollIntoView({
                    behavior: "auto",
                    block: "nearest"
                });
            }
        }

        menuButtons.forEach((button) => {
            button.addEventListener("click", () => {
                openSection(button);
            });
        });

        backButton.addEventListener("click", showAllSections);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initDisclosure,
            { once: true }
        );
    } else {
        initDisclosure();
    }
})();