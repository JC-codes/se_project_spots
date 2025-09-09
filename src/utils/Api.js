class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
  }

  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }
  getInitialCards() {
    return fetch(`${this._baseUrl}/cards`, {
      headers: this._headers,
    }).then(this.checkResponse);
  }

  getUserInfo() {
    return fetch(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    }).then(this.checkResponse);
  }

  editUserInfo({ name, about }) {
    return fetch(`${this._baseUrl}/users/me`, {
      method: "PATCH",
      headers: {
        ...this._headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        about,
      }),
    }).then(this.checkResponse);
  }

  addNewCard({ name, link }) {
    return fetch(`${this._baseUrl}/cards`, {
      method: "POST",
      headers: {
        ...this._headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        link,
      }),
    }).then(this.checkResponse);
  }

  addNewAvatar({ avatar }) {
    return fetch(`${this._baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: {
        ...this._headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar,
      }),
    }).then(this.checkResponse);
  }

  deleteCard(cardId) {
    return fetch(`${this._baseUrl}/cards/${cardId}`, {
      method: "DELETE",
      headers: this._headers,
    }).then(this.checkResponse);
  }

  handleLike(cardId, isLiked) {
    return fetch(`${this._baseUrl}/cards/${cardId}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
      headers: this._headers,
    }).then(this.checkResponse);
  }

  addLike(cardId) {
    return this.handleLike(cardId, false);
  }

  removeLike(cardId) {
    return this.handleLike(cardId, true);
  }
}

export default Api;
