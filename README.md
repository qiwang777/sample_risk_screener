# Qi's sample full Stack Engineering Project

## Overview
Create a user interface to show a list of securities for a given date. Each security will also have a time series of metrics, with multiple values per date, and users should be provided the most recent set of metrics per security for the given date.

In Python, use flask (or fast api) to expose REST endpoints that provide the necessary data to the UI.
In TypeScript and React, use Ag-Grid and any other UI libraries required to display the data in a tabular format.

## Functionalities

* Choose a specific date to get the securities
* View those securities in a tabular grid
* View the most recent version of each security's metrics for that date
* Filter the securities by fields other than date
* CRUD operations on securities and metrics

## How to start
* `client` folder containing a vite/React/TS application with Ag-Grid installed
* `server` folder containing a Python flask (or fast api) application and data files representing the securities and metrics

* First do 'npm install' to install all packages
* Go to 'server' folder and execute 'main.py' to start the service
* Go to 'client' folder and execute 'npm run dev' to start the frond end page