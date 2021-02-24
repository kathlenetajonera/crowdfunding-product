const navbar = document.querySelector(".nav");
const navicon = document.querySelector(".nav__toggle");
const menu = document.querySelector(".nav__menu");
const overlay = document.querySelector(".overlay");
const bookmarkBtn = document.querySelector(".card__bookmark");
const LOCAL_STORAGE_BOOKMARK = localStorage.getItem("isBookmarked") || [];
const rewardSelection = document.querySelectorAll("[data-selection]");
const pledgeSelection = document.querySelectorAll(".card__pledge-item-select");
const modal = document.querySelector(".card--modal");
const modalClose = document.querySelector(".card__close");
const pledgeBtn = document.querySelector("#pledgeBtn");

const disableScrolling = () => document.body.style.position = "fixed";
const enablecrolling = () => document.body.style.position = "";
let windowWidth = window.innerWidth;

navicon.addEventListener("click", toggleMobileMenu);
bookmarkBtn.addEventListener("click", updateBookmark);

checkStorage();

function toggleMobileMenu() {
    const isOpen = navicon.getAttribute("aria-expanded");

    if (isOpen === "true") {
        animateMobileMenu("close");
        removeClass("active", navicon);
        removeClass("active", overlay);

        navicon.setAttribute("aria-expanded", "false");
        enablecrolling();
    } else {
        animateMobileMenu("open");
        addClass("active", navicon);
        addClass("active", overlay);
        
        navicon.setAttribute("aria-expanded", "true");
        disableScrolling();
    }
}

function animateMobileMenu(animate) {
    if (animate === "open") {
        removeClass("close", menu);
        addClass("open", menu);
    } else {
        removeClass("open", menu)
        addClass("close", menu);

        setTimeout(() => {
            removeClass("close", menu);
        }, 1000);
    }
}

function updateBookmark() {
    // if (LOCAL_STORAGE_BOOKMARK) {
    //     if (LOCAL_STORAGE_BOOKMARK === "true") {
    //         addClass("active", bookmarkBtn);
    //     }
    // } else {
    //     if (bookmarkBtn.classList.contains("card__bookmark--active")) {
    //         removeClass("active", bookmarkBtn);
    //         localStorage.setItem("isBookmarked", false);
    //     } else {
    //         addClass("active", bookmarkBtn);
    //         localStorage.setItem("isBookmarked", true);
    //     }
    // }

    if (bookmarkBtn.classList.contains("card__bookmark--active")) {
        removeClass("active", bookmarkBtn);
        localStorage.setItem("isBookmarked", false);
    } else {
        addClass("active", bookmarkBtn);
        localStorage.setItem("isBookmarked", true);
    }
}

function addClass(className, element) {
    const blockName = element.classList[0];

    element.classList.add(`${blockName}--${className}`)
}

function removeClass(className, element) {
    const blockName = element.classList[0];

    element.classList.remove(`${blockName}--${className}`)
}

function checkStorage() {
    if (LOCAL_STORAGE_BOOKMARK) {
        if (LOCAL_STORAGE_BOOKMARK === "true") {
            addClass("active", bookmarkBtn);
        }
    }
}

window.addEventListener("resize", () => {
    if (windowWidth != window.innerWidth) {
        windowWidth = window.innerWidth;

        if (windowWidth > 768) {
            removeClass("active", navicon);
            removeClass("open", menu);
            removeClass("active", overlay);

            navicon.setAttribute("aria-expanded", "false");
            enablecrolling();
        }
    }
})

pledgeSelection.forEach(selection => {
    selection.addEventListener("click", e => {
        const clickedElem = e.target;
        const tagName = clickedElem.tagName.toLowerCase();

        e.preventDefault();

        //prevents item deseletion when input is clicked
        if (tagName === "input") return;

        //toggles item selection
        if (clickedElem.classList.contains("card__pledge-item")) {
            selectPledge(clickedElem);
        } else if (tagName === "button" && clickedElem.classList.contains("button--cost") || clickedElem.classList.contains("card__number--cost")) {
            const pledgeCost = clickedElem.closest(".button--cost");
            if (pledgeCost.classList.contains("button--cost-active")) {
                removeClass("cost-active", pledgeCost);
            } else {
                addClass("cost-active", pledgeCost);
            }
        } else if (tagName === "button" && clickedElem.hasAttribute("data-continue")) {
            const pledgeCostBtn = clickedElem.previousElementSibling;

            if (pledgeCostBtn.classList.contains("button--cost-active")) {
                const pledgeCost = pledgeCostBtn.dataset.value;

                savePledge(pledgeCost);
            } else {
                console.log("please enter value");
            }
        } else {
            const parentCard = clickedElem.closest(".card__pledge-item")
            selectPledge(parentCard);
        }
    })
})

pledgeBtn.addEventListener("click", openPledgeModal)

modalClose.addEventListener("click", () => {
    removeClass("active", overlay);
    removeClass("modal-active", modal)
})

rewardSelection.forEach(reward => {
    reward.addEventListener("click", () => {
        const target = reward.dataset.target;
        const targetItem = document.getElementById(target);

        openPledgeModal();
        selectPledge(targetItem);
    })
})

function openPledgeModal() {
    addClass("active", overlay);
    addClass("modal-active", modal);
}

function selectPledge(selectedItem) {
    const radioInput = selectedItem.querySelector(".form__radio-input");
    const pledgeCostBtn = selectedItem.querySelector(".button--cost");
    const isChecked = radioInput.checked;

    if (isChecked) {
        radioInput.checked = false;
        removeClass("selected", selectedItem);
        removeClass("cost-active", pledgeCostBtn);
    } else {
        radioInput.checked = true;

        //removes selected class on all items
        pledgeSelection.forEach(item => {
            removeClass("selected", item);
        })

        addClass("selected", selectedItem);
    }
}

function savePledge(cost) {
    console.log(cost);
}