from flask import render_template, jsonify, request
from app import app

# with all the hype around  AI this projects allows for users to understand that the quality of the information that AI tools output, significantly depends on the data that the ai model is fed. This project brings awarness to the problem of data, its regulations to avoid bias and other unethical practices, this will be even more important in the future as dependance of humanity on AI increases (give an official reference).

# this projects also shows that collecting and sorting data can be hard, the more data (images) the person gives to the model the better the model will be at predicting the number, this is a good example of how the quality of the data affects the model, and how the model can be improved by adding more data.

# one of the errors: not enough samples to train the model, should be properly handled, and also included in the documentation.
# another one of the errors is that maybe a random number is not the best solution, so instead use a list (0-9)
# one another can be the problem that there arent enough samples to train the model, so maybe if the user doesnt want to draw that many randomly double the samples you have so that they are abut 100, so 10 image per number
# another problem is that the trained model is outputting the same number for different pictures, changes from random to a specified list of numbers, will ask the user to complete anbout 20 pictures, but better 100. To solve this problem I made a separate progrom in jupyter notebook that is imitating the training of the model to see what errors i might have overlooked. (also try to save the image in this program after preprocessing because the first thing i am noticing is that the images are coming just as black squares, this may be due to how what images are being saved from the canvas, my ones dont have any background)
# after runing the model i use in this programm in jupyter notebook, i found that the images returned by the canvas are not it the right format, the actual problem is that the images dont have a background therefore, the model is just using black squares instead of actual images with number, that why its returing the same result no mater what image you choose, it behaves in the same way in jupyter notebook code.
# after adding the white background to the pictures the code works fine, the model returns different results for different images, it is moslty wrong, but we are not expecting a high accuracy here as there are still steps i need to take to calibarte the model (number of samples, batch size, epochs, etc.)
# adjusting the model to train on 100 - 1000 samples with the best results, the original mnist dataset has 70000 samples, we cannot afford this luxury in the project as the user will not be able to draw 70000 images, so we will have to make do with what we have, and try to make the best of it.

# min samples that have to be provided by the user is 10.

# the number of samples has to be the same for each digit other ways the model will have a big bias towards the digit that has the most samples, need to fix the code so that once the user has provided 10 samples and they provide more, they might stop on a random number like 2 so the model will have 1 cycle od numbers, and then an addition to that 0, 1, 2 samples from the next cycle that has not been completed , so this needs to be addressed in the code by counting how many samples are for each digit and making sure that there are 100 samples of each digit, right now i am just multiplying the whole dataset by 20 which is not ideal

#possible improvements: allow the user to train the model see the results than train the model more. Currently you can submit an empty canvas to train the model on this is not good, and the user should not be able to do that.
drawings = []

from tensorflow.keras import Sequential, layers

# Define the model structure globally
# change the model to a one that would be more suitable for the task
model = Sequential([
    layers.InputLayer(input_shape=(28, 28, 1)),
    layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
    layers.MaxPooling2D(pool_size=(2, 2)),
    layers.Flatten(),
    layers.Dropout(0.5),
    layers.Dense(10, activation="softmax"),  # Assuming 10 classes for digit classification
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

    # Save the drawing and label to your array
    drawings.append({'image': image_data, 'label': label})

   
   
    if int(numberToDraw) == 9:
        numberToDraw = 0
    else:
        numberToDraw = int(numberToDraw) + 1


    # this can be accessed in the JavaScript callback with the keyword 'data'
    response = {'message': 'Drawing saved successfully', 'total_drawings': len(drawings), 'new_number': numberToDraw}
    
    return jsonify(response)





import base64
import numpy as np
from PIL import Image
from io import BytesIO
import tensorflow.keras as keras
from tensorflow.keras import layers

def preprocess_images_and_labels(drawings):
    x_train = []
    y_train = []
    
    for item in drawings:
        # Decode the image
        image_data = base64.b64decode(item['image'].split(',')[1])
        image = Image.open(BytesIO(image_data))
        
        # Resize and convert to grayscale if necessary
        image_resized = image.resize((28, 28)).convert('L')
        
        # Convert to numpy array and scale the pixel values
        image_array = np.array(image_resized, dtype=np.float32) / 255.0
        
        # Append to the training data
        x_train.append(image_array)
        
        # Append the label
        y_train.append(int(item['label']))
    
    # Convert lists to numpy arrays
    x_train = np.array(x_train)
    y_train = np.array(y_train)
    
    # Add a channel dimension and one-hot encode labels
    x_train = np.expand_dims(x_train, -1)
    y_train = keras.utils.to_categorical(y_train, 10)
    
    return x_train, y_train




@app.route('/train-model', methods=['POST'])
def train_model():
    global drawings  # Ensure you're using the global variable


    # min number of samples if 10 
    # if len(drawings) < 10:
    #     return jsonify({'error': 'You need to provide at least 10 samples to train the model'})

    #then get the closest n 10 number and multiply by 10 (14 -> 100, 22 -> 200, 45 -> 500) and adjust the number of samples to be the same for each digit   

    # save this code so that you can include it in your documentation and how you solved it.
    n = 1  # Number of times to duplicate each element within the list
    m = 20  # Number of times to repeat the entire list

    # Duplicate each element in the drawings list 'n' times
    duplicated_drawings = [drawing for drawing in drawings for _ in range(n)]

    # Repeat the entire list 'm' times
    drawings = duplicated_drawings * m
    
    # Preprocess the images and labels
    x_train, y_train = preprocess_images_and_labels(drawings)
    
  
    # Compile the model
    model.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
    
    # Train the model
    batch_size = 30
    epochs = 5
    model.fit(x_train, y_train, batch_size=batch_size, epochs=epochs, validation_split=0.1)
    
 
    
    # Clear the drawings list after training
    drawings = []
    
    return jsonify({'message': 'Model trained successfully'})


def preprocess_drawn_image(drawn_image_data):
    # Assuming 'drawn_image_data' contains the base64 encoded image data
    image_data = base64.b64decode(drawn_image_data.split(',')[1])
    image = Image.open(BytesIO(image_data))
    image_resized = image.resize((28, 28)).convert('L')
    image_array = np.array(image_resized, dtype=np.float32) / 255.0
    image_array = np.expand_dims(image_array, -1)
    
    return image_array


# @app.route('/predict')
# def predict_page():
#     return render_template('predict.html')


@app.route('/make-prediction', methods=['POST'])
def make_prediction():
    data = request.get_json()
    drawn_image_data = data['drawn_image_data']

    # Preprocess the drawn image
    drawn_image = preprocess_drawn_image(drawn_image_data)

    # Make a prediction using the trained model
    predictions = model.predict(np.array([drawn_image]))
    predicted_number = np.argmax(predictions)
       # Convert numpy int64 to native Python int
    predicted_number = int(predicted_number)

    print(f'Predicted number: {predicted_number}')

    return jsonify({'predicted_number': predicted_number})

