import "./index.css";
import Api from "../utils/Api.js";

import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import { setButtonLoadingState } from "../utils/helpers.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "93405f12-bba0-4913-9935-a5bd1390e415",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    console.log("User data:", userData);
    console.log("Cards data:", cards);
    profileNameElement.textContent = userData.name;
    profileJobElement.textContent = userData.about;
    editProfileNameInput.value = userData.name;
    editProfileJobInput.value = userData.about;

    api.userId = userData._id;

    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardList.append(cardElement);
    });
  })
  .catch(console.error);

//Profile elements
const editProfileButton = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = document.forms["profile-form"];
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileJobInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const profileNameElement = document.querySelector(".profile__name");
const profileJobElement = document.querySelector(".profile__description");

//Edit Avatar elements
const editAvatarButton = document.querySelector(".profile__avatar-container");
const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarForm = document.forms["avatar-form"];
const editAvatarLinkInput = editAvatarModal.querySelector(
  "#profile-avatar-input"
);
const profileAvatarElement = document.querySelector(".profile__avatar");

//New post elements
const newPostModal = document.querySelector("#new-post-modal");
const newPostButton = document.querySelector(".profile__add-btn");
const newPostForm = document.forms["new-post-form"];
const newPostLinkInput = newPostModal.querySelector("#image-link-input");
const newPostCaptionInput = newPostModal.querySelector(
  "#profile-caption-input"
);
const cardSubmitButton = newPostModal.querySelector("#new-post-submit-btn");

//Preview elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImg = document.querySelector(".modal__image");
const previewModalCaption = document.querySelector(".modal__caption");
const closeBtns = document.querySelectorAll(".modal__close-btn");

//Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.forms["delete-form"];
const deleteBtn = deleteModal.querySelector(".modal__close-btn");

let selectedCard, selectedCardId;

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitle = cardElement.querySelector(".card__title");
  const cardImage = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_active");
  }

  cardLikeBtn.addEventListener("click", (event) => {
    const isLiked = event.target.classList.contains("card__like-btn_active");
    api
      .handleLike(data._id, isLiked)
      .then((updatedCard) => {
        event.target.classList.toggle("card__like-btn_active");
      })
      .catch(console.error);
  });

  cardDeleteBtn.addEventListener("click", (evt) => {
    selectedCard = cardElement;
    selectedCardId = data._id;
    openModal(deleteModal);
  });

  cardImage.addEventListener("click", () => {
    previewModalImg.src = data.link;
    previewModalImg.alt = data.name;
    previewModalCaption.textContent = data.name;

    openModal(previewModal);
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverlayClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverlayClose);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function handleOverlayClose(evt) {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.target);
  }
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  setButtonLoadingState(evt.submitter, true);
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileJobInput.value,
    })
    .then((data) => {
      profileNameElement.textContent = data.name;
      profileJobElement.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonLoadingState(evt.submitter, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  setButtonLoadingState(evt.submitter, true);
  api
    .addNewCard({
      name: newPostCaptionInput.value,
      link: newPostLinkInput.value,
    })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardList.prepend(cardElement);
      newPostForm.reset();
      disableButton(cardSubmitButton, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonLoadingState(evt.submitter, false);
    });
}

function handleAddAvatarSubmit(evt) {
  evt.preventDefault();
  setButtonLoadingState(evt.submitter, true);
  api
    .addNewAvatar({
      avatar: editAvatarLinkInput.value,
    })
    .then((data) => {
      profileAvatarElement.src = data.avatar;
      editAvatarForm.reset();
      disableButton(evt.submitter, settings);
      closeModal(editAvatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonLoadingState(evt.submitter, false);
    });
}

function handleDeleteCardSubmit(evt) {
  evt.preventDefault();
  setButtonLoadingState(evt.submitter, true, "Deleting...", "Delete");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonLoadingState(evt.submitter, false, "Deleting...", "Delete");
    });
}

editProfileButton.addEventListener("click", function () {
  editProfileNameInput.value = profileNameElement.textContent;
  editProfileJobInput.value = profileJobElement.textContent;
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileJobInput],
    settings
  );
  openModal(editProfileModal);
});

editAvatarButton.addEventListener("click", function (evt) {
  openModal(editAvatarModal);
});

newPostButton.addEventListener("click", function () {
  openModal(newPostModal);
});

closeBtns.forEach((button) => {
  const modalPopup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(modalPopup));
});

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleAddCardSubmit);
editAvatarForm.addEventListener("submit", handleAddAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteCardSubmit);

enableValidation(settings);
