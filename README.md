# 42 Transcendence

This repository contains my final project for the 42 school's Common Core: A fully functional single page application from scratch.

## Project Overview

The Transcendence project is a sophisticated web application designed to showcase various technologies and development practices. As a final project for the 42 school, it encapsulates a wide range of skills and knowledge acquired throughout the program.

## Technologies Used

- **JavaScript**: The primary language used for frontend development, ensuring a dynamic and interactive user experience.
- **Python**: Utilized for backend services, providing robust and scalable server-side logic.
- **CSS**: Employed for styling the application, ensuring a responsive and visually appealing design.
- **HTML**: The backbone of the web pages, structuring the content for accessibility and SEO.
- **Makefile**: Used for automating the build process and managing project dependencies.
- **Shell**: Scripts for various automation tasks, such as deployment and environment setup.
- **Dockerfile**: Containerization of the application, ensuring consistency across different environments.

## Features Implemented

- **User Authentication**: Secure login and registration system with session management.
- **2FA option**: Secure Two-Factor-Authentication <ins>pyotp</ins> and QR-Code generation.
- **Responsive Design**: Ensuring the application is accessible on various devices, including mobiles and tablets.
- **Database Integration**: Utilized <ins>PostgreSQL</ins> database for storing and retrieving user data efficiently.
- **API Development**: Custom APIs for handling various functionalities like user management, messaging, etc.
- **Error Handling**: Comprehensive error handling to ensure a smooth user experience.
- **Testing & Monitoring**: Integration tests and Monitoring via <ins>Prometheus</ins> and <ins>Grafana</ins> to ensure the reliability and stability of the application.

## Getting Started

To get a local copy of the project up and running, follow these simple steps:

1. **Clone the repo**
    ```sh
    git clone https://github.com/Cuteness-overload/42_Transcendence.git
    ```

2. **Update .env file**
    ```sh
    cd 42_Transcendence
    vim .env
    # Update the various secret keys, IDs and passwords as you see fit.
    ```

3. **Start the application**
    ```sh
    make
    ```

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Contact

Project Link: [https://github.com/Cuteness-overload/42_Transcendence](https://github.com/Cuteness-overload/42_Transcendence)
