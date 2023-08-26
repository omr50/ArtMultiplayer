import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from keras.models import load_model
from PIL import Image
import numpy as np
import io
import base64

app = Flask(__name__)

CORS(app)

big_string = '''flashlight
belt
mushroom
pond
strawberry
pineapple
sun
cow
ear
bush
pliers
watermelon
apple
baseball
feather
shoe
leaf
lollipop
crown
ocean
horse
mountain
mosquito
mug
hospital
saw
castle
angel
underwear
traffic_light
cruise_ship
marker
blueberry
flamingo
face
hockey_stick
bucket
campfire
asparagus
skateboard
door
suitcase
skull
cloud
paint_can
hockey_puck
steak
house_plant
sleeping_bag
bench
snowman
arm
crayon
fan
shovel
leg
washing_machine
harp
toothbrush
tree
bear
rake
megaphone
knee
guitar
calculator
hurricane
grapes
paintbrush
couch
nose
square
wristwatch
penguin
bridge
octagon
submarine
screwdriver
rollerskates
ladder
wine_bottle
cake
bracelet
broom
yoga
finger
fish
line
truck
snake
bus
stitches
snorkel
shorts
bowtie
pickup_truck
tooth
snail
foot
crab
school_bus
train
dresser
sock
tractor
map
hedgehog
coffee_cup
computer
matches
beard
frog
crocodile
bathtub
rain
moon
bee
knife
boomerang
lighthouse
chandelier
jail
pool
stethoscope
frying_pan
cell_phone
binoculars
purse
lantern
birthday_cake
clarinet
palm_tree
aircraft_carrier
vase
eraser
shark
skyscraper
bicycle
sink
teapot
circle
tornado
bird
stereo
mouth
key
hot_dog
spoon
laptop
cup
bottlecap
The_Great_Wall_of_China
The_Mona_Lisa
smiley_face
waterslide
eyeglasses
ceiling_fan
lobster
moustache
carrot
garden
police_car
postcard
necklace
helmet
blackberry
beach
golf_club
car
panda
alarm_clock
t-shirt
dog
bread
wine_glass
lighter
flower
bandage
drill
butterfly
swan
owl
raccoon
squiggle
calendar
giraffe
elephant
trumpet
rabbit
trombone
sheep
onion
church
flip_flops
spreadsheet
pear
clock
roller_coaster
parachute
kangaroo
duck
remote_control
compass
monkey
rainbow
tennis_racquet
lion
pencil
string_bean
oven
star
cat
pizza
soccer_ball
syringe
flying_saucer
eye
cookie
floor_lamp
mouse
toilet
toaster
The_Eiffel_Tower
airplane
stove
cello
stop_sign
tent
diving_board
light_bulb
hammer
scorpion
headphones
basket
spider
paper_clip
sweater
ice_cream
envelope
sea_turtle
donut
hat
hourglass
broccoli
jacket
backpack
book
lightning
drums
snowflake
radio
banana
camel
canoe
toothpaste
chair
picture_frame
parrot
sandwich
lipstick
pants
violin
brain
power_outlet
triangle
hamburger
dragon
bulldozer
cannon
dolphin
zebra
animal_migration
camouflage
scissors
basketball
elbow
umbrella
windmill
table
rifle
hexagon
potato
anvil
sword
peanut
axe
television
rhinoceros
baseball_bat
speedboat
sailboat
zigzag
garden_hose
river
house
pillow
ant
tiger
stairs
cooler
see_saw
piano
fireplace
popsicle
dumbbell
mailbox
barn
hot_tub
teddy-bear
fork
dishwasher
peas
hot_air_balloon
keyboard
microwave
wheel
fire_hydrant
van
camera
whale
candle
octopus
pig
swing_set
helicopter
saxophone
passport
bat
ambulance
diamond
goatee
fence
grass
mermaid
motorbike
microphone
toe
cactus
nail
telephone
hand
squirrel
streetlight
bed
firetruck'''

items = big_string.split('\n')

# SOURCE FOR DOODLE-NET MODEL
# https://github.com/yining1023/doodleNet/tree/master
model = load_model('doodleNet-model.h5', compile=False)


# image has to have either black or white pixel for model (no gray in the middle)
# binarize will make each pixel go to white or black depending on threshold.
# so basically end up with all light pixels (grayish / white) become full white.
# darker pixels (dark gray) become black.
def binarize_image(img, threshold=128):
    """Binarize an image using a threshold."""
    img = img.point(lambda p: 255 if p > threshold else 0)
    return img


@app.route('/predict', methods=['POST'])
def predict():
    # Extracting JSON data from POST request
    data = request.json
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    # Extract actual base64 part by removing "data:image/png;base64,"
    # this was the form the png image is sent in to be more efficient.
    # after extracting, we prep the image to make it suitable for the
    # model.
    base64_image = data['canvas_data'].split(",")[-1]
    image_data_bytes = base64.b64decode(base64_image)
    img = Image.open(io.BytesIO(image_data_bytes))

    room = data.get('room_name')
    user_id = data.get('user_id')

    # Convert blob data to image and preprocess
    img = img.resize((28, 28)).convert('L')
    img = Image.eval(img, lambda x: 255 - x)
    img = binarize_image(img, threshold=1)
    img_array = np.array(img).reshape(1, 28, 28, 1) / 255.0

    # Model prediction
    predictions = model.predict(img_array)
    top_classes = np.argsort(predictions[0])[-4:][::-1]

    # the model returns numbers
    # for prediction so get the
    # corresponding element.
    guesses = []
    for num in top_classes:
        guesses.append(items[num])

    # print(user_id, room, guesses)
    return jsonify({'message': {'guesses': guesses, 'room': room, 'user_id': user_id}}), 200


@app.get('/')
def respond():
    return "Hi"

# better to use http requests then socket

# since they are coming in about every 3 seconds.
# no need for socket.

# @socketio.on('canvasData')
# def handle_canvas_data(data):
    # # browser sends data blob of canvas to node server.
    # # node server handles real time updates between clients.
    # # It sends the data here for the model to assess it.
    # image_data = data['blob']

    # # Convert blob data to image and preprocess
    # img = Image.open(io.BytesIO(image_data))
    # img = img.resize((28, 28)).convert('L')
    # img = Image.eval(img, lambda x: 255 - x)
    # img = binarize_image(img, threshold=1)
    # img_array = np.array(img).reshape(1, 28, 28, 1) / 255.0

    # # Model prediction
    # predictions = model.predict(img_array)
    # top_classes = np.argsort(predictions[0])[-10:][::-1]

    # # the model returns numbers
    # # for prediction so get the
    # # corresponding element.
    # guesses = []
    # for num in top_classes:
    #     guesses.append(items[num])

#     print(guesses)

#     # Emitting results back to NodeJS server
#     emit('predictionResults', {'predictions': guesses})


if __name__ == '__main__':

    # socketio.run(app, host='0.0.0.0', port=5000)
    app.run(debug=True)
