
import os
from playwright.sync_api import sync_playwright

def verify_labor_planning(page):
    # Simulate Authentication
    page.add_init_script("""
        localStorage.setItem('token', 'fake-jwt-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    """)

    # Mock Processes API
    page.route('**/api/processes', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='[{"id": "1", "name": "Inbound Recebimento"}, {"id": "2", "name": "Outbound Picking"}]'
    ))

    # Mock Calculate API
    page.route('**/api/labor-planning/calculate', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        body='''[
            {
                "processName": "Inbound Recebimento",
                "volume": 15000,
                "requiredHeadcount": 10.5,
                "supportHeadcount": 2.0
            },
            {
                "processName": "Outbound Picking",
                "volume": 25000,
                "requiredHeadcount": 20.0,
                "supportHeadcount": 3.5
            }
        ]'''
    ))

    # Go to Labor Planning Page
    page.goto('http://localhost:5173/dashboard/labor-planning')

    # Wait for page to load
    page.wait_for_selector('h2:has-text("Planejamento de Labor")')

    # Fill Global Parameters
    page.fill('input[name="inboundVolume"]', '15000')
    page.fill('input[name="outboundVolume"]', '25000')
    page.fill('input[name="workingHoursPerShift"]', '8')

    # Click Calculate
    page.click('button:has-text("Calcular Headcount")')

    # Wait for results
    page.wait_for_selector('table')

    # Take screenshot
    page.screenshot(path='/home/jules/verification/labor_planning.png', full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_labor_planning(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
