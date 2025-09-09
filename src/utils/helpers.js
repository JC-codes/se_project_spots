export function setButtonLoadingState(
  button,
  isLoading,
  isLoadingText = "Saving...",
  defaultText = "Save"
) {
  if (isLoading) {
    button.textContent = isLoadingText;
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
}
