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

model.ipynb: machine learning on car data. 

scraper.ipynb: scraping all makes and models up front and putting them in excel file

scraper.py: Flask app for backend of web app

dropdown_info: contains json files of car information, like mappings of makes to models

encoders: contains encoders used to encode specific attributes of a car

random_forest_model.pkl: best model i found in model.ipynb


other notes:

use terminal to create branch:
git checkout -b branch-name

when done changing:
git add .
git commit -m "message"
git push origin branch-name

create pull request on github
merge pull request on github

delete branch locally:
git checkout main
git pull origin main
git branch -d branch-name