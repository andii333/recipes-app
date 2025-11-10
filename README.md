# Project Notes

This API does not allow performing a complex query with multiple filters, so I used two types of requests to fetch recipes:
1. Fetching all recipes in the default order with a search-by-letters function.
2. Fetching recipes by a specific tag.

Therefore, when searching by tag, the search string by letters is cleared, and when searching by letters, the selected tag is reset.
Since there is pagination, any changes made when deleting or editing a recipe are temporary and reset upon a new fetch of recipes.
Additionally, I did not consider it necessary to store the loaded recipes, because doing so would disrupt the order of recipes when changing the tag or entering a new search string.

# Recipes App

This is a simple Angular application for managing and browsing recipes.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- Angular CLI (v16 or higher recommended)

To install Angular CLI globally, run:

npm install -g @angular/cli

---

## Installation

1. Clone the repository:

git clone (https://github.com/andii333/recipes-app)
cd recipes-app

2. Install dependencies:

npm install

---

## Running the Application

To start the development server:

ng serve

The app will be available at: http://localhost:4200

Note: The development server supports live-reloading, so any changes you make to the code will automatically refresh the app.

---

## Building for Production

To build the project for production:

ng build --prod

The compiled files will be in the `dist/` directory. You can then deploy them to any web server.

---

## Running Unit Tests

To run the unit tests:

ng test

This will run tests using Karma and display the results in the console and browser.

---

## Running End-to-End (E2E) Tests

To run e2e tests:

ng e2e

This will execute tests using Cypress or Protractor depending on your setup.

---

## Technologies Used

- Angular 20
- TypeScript
- PrimeNG (UI components)
- RxJS
- HTML/CSS/SCSS

