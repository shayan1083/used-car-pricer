create venv:
python3 -m venv venv

start venv:
source venv/bin/activate

install requirements:
pip3 install -r requirements.txt
playwright install

playwright codegen website_to_be_scraped.com <-- gives real time playwright code while browsing website


Web app to predict price of a used car given specific information 

car-price-app: react folder for frontend; edit proxy in package.json with backend url
 - /src/pages/home.js: main page

CarData.xlsx: scraped data placed in here. will be huge file probably

model.ipynb: machine learning on car data. currently changing how i scrape data so this is not up to date

scraper.ipynb: scraping all makes and models up front and putting them in excel file

scraper.py: Flask app for backend of web app

