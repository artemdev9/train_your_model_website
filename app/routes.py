from flask import render_template, jsonify, request
from app import app
import random
import base64
import numpy as np
from PIL import Image
from io import BytesIO
import tensorflow.keras as keras
from tensorflow.keras import Sequential, layers

drawings = []

model = Sequential([
    layers.InputLayer(input_shape=(28, 28, 1)),
    layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Flatten(),
    layers.Dropout(0.5),
    layers.Dense(10, activation="softmax"),  
])

@app.route('/')
def index():
    return render_template('index.html', random_number=0)

@app.route('/save-drawing', methods=['POST'])
def save_drawing():
    data = request.get_json()
    image_data = data['image']
    label = data['label']
    numberToDraw = data['numberToDraw']
    drawings.append({'image': image_data, 'label': label})
    if int(numberToDraw) == 9:
        numberToDraw = 0
    else:
        numberToDraw = int(numberToDraw) + 1
    return jsonify({'message': 'Drawing saved successfully', 'new_number': numberToDraw})



def preprocess_images_and_labels(drawings):
    x_train = []
    y_train = []    
    for item in drawings:
        image_data = base64.b64decode(item['image'].split(',')[1])
        image = Image.open(BytesIO(image_data))        
        image_resized = image.resize((28, 28)).convert('L')       
        image_array = np.array(image_resized, dtype=np.float32) / 255.0        
        x_train.append(image_array)    
        y_train.append(int(item['label']))
    x_train = np.array(x_train)
    y_train = np.array(y_train)
    x_train = np.expand_dims(x_train, -1)
    y_train = keras.utils.to_categorical(y_train, 10)
    return x_train, y_train




@app.route('/train-model', methods=['POST'])
def train_model():
    global drawings      
    numberOfSamples = round(len(drawings) / 10) * 100
    numberOfSamplesPerDigit = numberOfSamples / 10

    def getAllItemsOfLabel(data, label):
        items_with_label = []

        for item in data:
            if item['label'] == label:
                items_with_label.append(item)

        return items_with_label   
     
    def addSamples(data, numberOfSamplesPerDigit):
        if not data:
            return data
        while len(data) < numberOfSamplesPerDigit:
            data.append(random.choice(data))  
        return data    
    
    label0array = getAllItemsOfLabel(drawings, '0')
    label1array = getAllItemsOfLabel(drawings, '1')
    label2array = getAllItemsOfLabel(drawings, '2')
    label3array = getAllItemsOfLabel(drawings, '3')
    label4array = getAllItemsOfLabel(drawings, '4')
    label5array = getAllItemsOfLabel(drawings, '5')
    label6array = getAllItemsOfLabel(drawings, '6')
    label7array = getAllItemsOfLabel(drawings, '7')
    label8array = getAllItemsOfLabel(drawings, '8')
    label9array = getAllItemsOfLabel(drawings, '9')
    addSamples(label0array, numberOfSamplesPerDigit)
    addSamples(label1array, numberOfSamplesPerDigit)
    addSamples(label2array, numberOfSamplesPerDigit)
    addSamples(label3array, numberOfSamplesPerDigit)
    addSamples(label4array, numberOfSamplesPerDigit)
    addSamples(label5array, numberOfSamplesPerDigit)
    addSamples(label6array, numberOfSamplesPerDigit)
    addSamples(label7array, numberOfSamplesPerDigit)
    addSamples(label8array, numberOfSamplesPerDigit)
    addSamples(label9array, numberOfSamplesPerDigit)
    drawingsUpdates = label0array + label1array + label2array + label3array + label4array + label5array + label6array + label7array + label8array + label9array
    x_train, y_train = preprocess_images_and_labels(drawingsUpdates)
    model.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
    batch_size = 30
    epochs = 5
    model.fit(x_train, y_train, batch_size=batch_size, epochs=epochs, validation_split=0.1)
    print(len(drawingsUpdates))
    return jsonify({'message': 'Model trained successfully'})


def preprocess_drawn_image(drawn_image_data):
    image_data = base64.b64decode(drawn_image_data.split(',')[1])
    image = Image.open(BytesIO(image_data))
    image_resized = image.resize((28, 28)).convert('L')
    image_array = np.array(image_resized, dtype=np.float32) / 255.0
    image_array = np.expand_dims(image_array, -1)
    return image_array

@app.route('/make-prediction', methods=['POST'])
def make_prediction():
    data = request.get_json()
    drawn_image_data = data['drawn_image_data']
    drawn_image = preprocess_drawn_image(drawn_image_data)
    predictions = model.predict(np.array([drawn_image]))
    predicted_number = np.argmax(predictions)
    predicted_number = int(predicted_number)
    predictions_list = predictions.tolist()
    return jsonify({'predicted_number': predicted_number, 'predictions': predictions_list})


