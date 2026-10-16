/* =========================================================
   ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ
========================================================= */

const menuButtons =
    document.querySelectorAll(".cabinet-menu-item");

const sections =
    document.querySelectorAll(".cabinet-section");


function openSection(sectionId) {

    sections.forEach(function(section) {

        section.classList.remove("active");

    });


    menuButtons.forEach(function(button) {

        button.classList.remove("active");

    });


    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active");
    }


    const selectedMenuButton =
        document.querySelector(
            '.cabinet-menu-item[data-section="' +
            sectionId +
            '"]'
        );

    if (selectedMenuButton) {
        selectedMenuButton.classList.add("active");
    }


    document
        .querySelector(".cabinet-sidebar")
        .classList.remove("open");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


menuButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        openSection(
            this.dataset.section
        );

    });

});



/* =========================================================
   БЫСТРЫЕ ПЕРЕХОДЫ
========================================================= */

document
    .querySelectorAll("[data-go]")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            openSection(
                this.dataset.go
            );

        });

    });



/* =========================================================
   МОБИЛЬНОЕ МЕНЮ
========================================================= */

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebar =
    document.querySelector(".cabinet-sidebar");


if (mobileMenuButton) {

    mobileMenuButton.addEventListener("click", function() {

        sidebar.classList.toggle("open");

    });

}



/* =========================================================
   ПЕРЕДАЧА ПОКАЗАНИЙ
========================================================= */

const readingForm =
    document.getElementById("readingForm");

const newReadingInput =
    document.getElementById("newReading");

const readingMessage =
    document.getElementById("readingMessage");

const currentReading =
    document.getElementById("currentReading");

const dashboardReading =
    document.getElementById("dashboardReading");

const readingsTable =
    document.querySelector("#readingsTable tbody");


let lastReading = 12458;


if (readingForm) {

    readingForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const newValue =
            Number(newReadingInput.value);


        if (!newValue) {

            readingMessage.textContent =
                "Введите показания.";

            return;

        }


        if (newValue <= lastReading) {

            readingMessage.textContent =
                "Новые показания должны быть больше предыдущих.";

            return;

        }


        const consumption =
            newValue - lastReading;


        const today =
            new Date();


        const date =
            today.toLocaleDateString("ru-RU");


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${date}</td>
            <td>${newValue.toLocaleString("ru-RU")} кВт·ч</td>
            <td>${consumption.toLocaleString("ru-RU")} кВт·ч</td>
            <td>
                <span class="table-status">
                    Принято
                </span>
            </td>
        `;


        readingsTable.prepend(row);


        lastReading =
            newValue;


        currentReading.textContent =
            newValue.toLocaleString("ru-RU");


        dashboardReading.textContent =
            newValue.toLocaleString("ru-RU");


        newReadingInput.min =
            newValue + 1;


        newReadingInput.value =
            "";


        readingMessage.textContent =
            "Показания успешно переданы.";

    });

}



/* =========================================================
   НОВОЕ ОБРАЩЕНИЕ
========================================================= */

const newRequestButton =
    document.getElementById("newRequestButton");

const requestFormPanel =
    document.getElementById("requestFormPanel");

const requestForm =
    document.getElementById("requestForm");

const requestsList =
    document.getElementById("requestsList");


if (newRequestButton) {

    newRequestButton.addEventListener("click", function() {

        requestFormPanel.classList.toggle("open");

    });

}


if (requestForm) {

    requestForm.addEventListener("submit", function(event) {

        event.preventDefault();


        const topic =
            document.getElementById("requestTopic").value;

        const message =
            document.getElementById("requestText").value.trim();


        if (!topic || !message) {
            return;
        }


        const requestNumber =
            Math.floor(
                100000 + Math.random() * 900000
            );


        const today =
            new Date().toLocaleDateString("ru-RU");


        const request =
            document.createElement("article");


        request.className =
            "request-row";


        request.innerHTML = `

            <div>

                <span class="request-status">
                    ПРИНЯТО
                </span>

                <strong>
                    ${topic}
                </strong>

                <p>
                    ${message}
                </p>

            </div>


            <div class="request-meta">

                <strong>
                    № ${requestNumber}
                </strong>

                <span>
                    ${today}
                </span>

            </div>

        `;


        requestsList.prepend(request);


        requestForm.reset();


        requestFormPanel.classList.remove("open");

    });

}