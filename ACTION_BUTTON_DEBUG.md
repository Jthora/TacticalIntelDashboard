## Social Share Button (2025-10-01)

- Location: Feed card footer (`FeedItem` component).
- Preconditions: Feed item must include a valid `link` URL.
- Expected behavior:
	- Clicking **Share** triggers `useSocialShare` hook.
	- Button label changes to `Sharing…` while the share workflow is in progress.
	- On success, a status message `Share opened in new window` is announced.
	- On failure, status message reads `Unable to share` and logs with category `SocialShare`.
- Manual test steps:
	1. Click **Share** on a feed item with a valid link.
	2. Confirm a new browser tab opens to the X.com intent URL (or native share sheet appears if supported).
	3. Repeat after disconnecting from the network to validate the fallback error message.
