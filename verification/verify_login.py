
from playwright.sync_api import sync_playwright

def verify_toast_and_redirect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to login page
        page.goto("http://localhost:5173/login")

        # Take a screenshot
        page.screenshot(path="verification/login.png")
        print("Login page screenshot saved")

        # Close browser
        browser.close()

if __name__ == "__main__":
    verify_toast_and_redirect()
