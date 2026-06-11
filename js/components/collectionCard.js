import { linkify } from "../utils/linkify.js";

export function createCollectionCard(container, collections) {

  container.innerHTML = "";

  
  collections.forEach((collection) => {
    const collectionItem = document.createElement("a");
    collectionItem.href = `https://joincanvart.vercel.app/collection/${collection.id}`;
    collectionItem.classList.add(
      "collectionItem",
      "card",
    );

    // -----------------------------
    // IMAGE CONTAINER
    // -----------------------------
    const imgContainer = document.createElement("div");

    imgContainer.classList.add("imgContainer");

    collectionItem.appendChild(imgContainer);

    const img = document.createElement("img");
    img.classList.add("collectionThumbnail");
    img.src = collection.thumbnail_url;
    img.alt =
      collection.description || collection.name;
        img.loading = "lazy";
    imgContainer.appendChild(img);

    // -----------------------------
    // OWNER INFO
    // -----------------------------
    const ownerInfo = document.createElement("div");

    ownerInfo.classList.add("ownerInfo");

    // Avatar
    const avatar = document.createElement("img");

    avatar.classList.add("ownerAvatar");

    avatar.src = collection.profiles.avatar_url;

    avatar.alt = collection.profiles.name;

    ownerInfo.appendChild(avatar);

    // Owner text wrapper
    const ownerText = document.createElement("div");

    ownerText.classList.add("ownerText");

    // Name
    const ownerName = document.createElement("p");

    ownerName.classList.add("ownerName");

    ownerName.textContent =
      collection.profiles.name;

    ownerText.appendChild(ownerName);

    // Username
    const ownerUsername =
      document.createElement("a");

    ownerUsername.classList.add(
      "ownerUsername",
    );

    ownerUsername.textContent =
      `@${collection.profiles.username}`;

    ownerUsername.href =
      `/profile/${collection.profiles.username}`;

    ownerText.appendChild(ownerUsername);

    ownerInfo.appendChild(ownerText);

    imgContainer.appendChild(ownerInfo);

    // -----------------------------
    // COLLECTION CONTENT
    // -----------------------------
    const collectionContent =
      document.createElement("div");

    collectionContent.classList.add(
      "collectionContent",
    );

    // Collection name
    const title = document.createElement("span");

    title.classList.add("text-bold");

    title.textContent = collection.name;

    collectionContent.appendChild(title);

    // Description
    const description =
      document.createElement("p");
      const descriptionText = linkify(collection.description);
description.innerHTML = descriptionText?.slice(0, 40) + "..."

    collectionContent.appendChild(description);

    collectionItem.appendChild(
      collectionContent,
    );

    // Append card
    container.prepend(collectionItem);
  });
}
