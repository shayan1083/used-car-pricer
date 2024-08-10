from flask import Flask, request, jsonify

import pandas as pd
import json
import joblib
import datetime
import pgeocode



app = Flask(__name__)


def get_car_makes_models():
    try:
        print("get_car_makes_models")
        with open('dropdown_info/makes_to_models.json', 'r') as f:
            data = json.load(f)
        makes = list(data.keys())
        models = data
        return makes, models
    except Exception as e:
        print(e)
        return [], {}

def get_car_trims(make,model):
    try:
        print("get_car_trims")
        with open('dropdown_info/makes_models_to_trims.json', 'r') as f:
            data = json.load(f)
        models_to_trims = {
            tuple(key.split('_')): trims for key, trims in data.items()
        }
        key = (make,model)   
        print("done")
        return models_to_trims.get(key, [])
    except Exception as e:
        print(e)
        return []

def get_model_colors(make,model):
    try:
        print("get_model_colors")
        with open('dropdown_info/makes_models_to_colors.json', 'r') as f:
            data = json.load(f)
        models_to_colors = {
            tuple(key.split('_')): colors for key, colors in data.items()
        }
        key = (make,model)   
        print("done")
        return models_to_colors.get(key, [])
    except Exception as e:
        print(e)
        return []

def predict_price(make,model,year,trim,mileage,color,engine,gas,location,transmission,fuel,drive):
    regressor = joblib.load('mae_3366.pkl')
    make_encoder = joblib.load('encoders/make_encoder.pkl')
    model_encoder = joblib.load('encoders/model_encoder.pkl')
    trim_encoder = joblib.load('encoders/trim_encoder.pkl')
    color_encoder = joblib.load('encoders/color_encoder.pkl')
    encoder = joblib.load('encoders/onehotencoder.pkl')
    new_car = pd.DataFrame({
    'Make':[make],
    'Model':[model],
    'Age':[year],
    'Trim':[trim],
    'Mileage':mileage,
    'Color':[color],
    'Engine_Size':engine,
    'Gas_Mileage':gas,
    'Location':[location],
    'Transmission':[transmission],
    'Fuel_Type':[fuel],
    'Drive_Type':[drive],
    })

    # replace year with age
    current_year = datetime.datetime.now().year
    new_car['Age'] = current_year - new_car['Age'].astype(int)

    # get coordinates from zip code
    nomi = pgeocode.Nominatim('us')
    location = nomi.query_postal_code(new_car['Location'][0])
    new_car['Latitude'] = location.latitude 
    new_car['Longitude'] = location.longitude 
    new_car = new_car.drop(columns=['Location'])

    # target encoding
    new_car['Make'] = make_encoder.transform(new_car['Make'])
    new_car['Model'] = model_encoder.transform(new_car['Model'])
    new_car['Trim'] = trim_encoder.transform(new_car['Trim'])
    new_car['Color'] = color_encoder.transform(new_car['Color'])

    # one hot encoding
    categorical_features = new_car[['Transmission', 'Fuel_Type', 'Drive_Type']]
    one_hot_encoded_new_car = encoder.transform(categorical_features)

    one_hot_encoded_new_car_df = pd.DataFrame(one_hot_encoded_new_car, columns=encoder.get_feature_names_out())
    new_car = pd.concat([new_car.drop(columns=['Transmission', 'Fuel_Type', 'Drive_Type']), one_hot_encoded_new_car_df], axis=1)

    predicted_price = regressor.predict(new_car)
    return predicted_price[0]



@app.route('/', methods=['GET'])
def test():
    print("Home route accessed")
    return "Home route accessed", 200



# get makes and models for each make
@app.route('/makes-models', methods=['GET'])
def car_makes_models():
    makes, models = get_car_makes_models()
    return jsonify({'makes': makes, 'models': models})

# get trims for the chosen make and model
@app.route('/trims', methods=['GET'])
def trims():
    make = request.args.get('make')
    model = request.args.get('model')
    if not make or not model:
        return jsonify({'error': 'Make, Model, And Zip Code Are Required'}), 400
    trims = get_car_trims(make,model)
    return jsonify({'trims': trims})

# get colors for the chosen model
@app.route('/colors', methods=['GET'])
def colors():
    make = request.args.get('make')
    model = request.args.get('model')
    if not make or not model:
        return jsonify({'error': 'Make, Model, And Zip Code Are Required'}), 400
    colors = get_model_colors(make,model)
    return jsonify({'colors': colors})

# perform analysis on data from excel file and predict a price
@app.route('/predict', methods=['GET'])
def predict():
    print("predict route")
    try:
        make = request.args.get('make')
        model = request.args.get('model')
        year = int(request.args.get('year'))
        trim = request.args.get('trim')
        mileage = int(request.args.get('mileage'))
        color = request.args.get('color')
        engine = float(request.args.get('engine'))
        gas = float(request.args.get('gas'))
        location = request.args.get('location')
        transmission = request.args.get('transmission')
        fuel = request.args.get('fuel')
        drive = request.args.get('drive')
    except ValueError:
        return jsonify({'error': 'Invalid input values'}), 400
    # scrape data and perform machine learning'
    predicted_value = predict_price(make,model,year,trim,mileage,color,engine,gas,location,transmission,fuel,drive)
    return jsonify({'predicted_value': predicted_value})

if __name__ == '__main__':
    app.run(debug=True)