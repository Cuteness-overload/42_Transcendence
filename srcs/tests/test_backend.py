import time
import requests
import os
import uuid

BASE_URL = "http://backend:8000"

def reset_database():
    print("Resetting database...")
    try:
        response = requests.post(f"{BASE_URL}/users/reset/")
        if response.status_code == 200:
            print("Database reset successfully:", response.json())
        else:
            print(f"Failed to reset database: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Error resetting database: {e}")

def wait_for_backend():
    print("Waiting for backend to be ready...")
    for _ in range(20):
        try:
            response = requests.get(f"{BASE_URL}/users/health/")
            if response.status_code == 200:
                print("Backend is ready.")
                return
        except requests.RequestException as e:
            print(f"Backend not ready yet: {e}")
        time.sleep(5)
    raise Exception("Backend not ready after multiple attempts.")

def test_register():
    unique_username = f"john_doe_{uuid.uuid4().hex[:6]}"
    data = {
        "username": unique_username,
        "password": "password123",
        "email": f"{unique_username}@example.com",
    }
    try:
        response = requests.post(f"{BASE_URL}/users/register/", json=data)
        print("Register:", response.status_code, response.text)
        return response.status_code == 201, unique_username
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return False, None

def test_login(username):
    data = {
        "username": username,
        "password": "password123",
        "code_2fa": ""
    }
    try:
        response = requests.post(f"{BASE_URL}/token/", json=data)
        response.raise_for_status()
        print("Login:", response.status_code, response.json())
        return response.json().get("access")
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return None

def test_verify_token(token):
    data = {"token": token}
    try:
        response = requests.post(f"{BASE_URL}/users/token/verify/", json=data)
        if response.status_code == 200:
            print("Token Verification: Token is valid.")
            return True
        else:
            print("Token Verification Failed:", response.status_code, response.text)
            return False
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return False

def run_tests():
    #reset_database()
    wait_for_backend()
    all_tests_passed = True

    print("\nRunning Test: Register")
    register_successful, unique_username = test_register()
    if not register_successful:
        print("❌ Register Test Failed")
        all_tests_passed = False
    else:
        print("✅ Register Test Passed")

    print("\nRunning Test: Login")
    token = test_login(unique_username)
    if not token:
        print("❌ Login Test Failed")
        all_tests_passed = False
    else:
        print("✅ Login Test Passed")

    if token:
        print("\nRunning Test: Verify Token")
        if not test_verify_token(token):
            print("❌ Token Verification Test Failed")
            all_tests_passed = False
        else:
            print("✅ Token Verification Test Passed")

    print("\n=== Test Results ===")
    if all_tests_passed:
        print("🎉 All tests passed successfully!")
    else:
        print("❌ Some tests failed. Please check the logs.")

#if __name__ == "__main__":
    #run_tests()
