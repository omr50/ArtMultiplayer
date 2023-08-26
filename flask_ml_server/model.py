# categories with a good prediction rate:

# House

# cat

# fish

# camera

# teddy bear

# bicycle

# sun

# hat

# tree

# lion

# telephone

# hand

# leaf

# star

# baseball

# car

# snowman

# guitar

# moustache


from PIL import Image
from keras.preprocessing import image
from keras.models import load_model
import numpy as np
from keras.optimizers import Adam


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

# Load the model
model = load_model('doodleNet-model.h5', compile=False)


def binarize_image(img, threshold=128):
    """Binarize an image using a threshold."""
    img = img.point(lambda p: 255 if p > threshold else 0)
    return img


# model.save('new_saved_model.h5')
img = Image.open('images/moustache4.png')
img = img.resize((28, 28)).convert('L')  # Resize and convert to grayscale

# Invert the colors. Black drawing on white background to white drawing on black background.
# Model requires this to predict accurately.
img = Image.eval(img, lambda x: 255 - x)

img = binarize_image(img, threshold=1)
# Save the processed image for reference
img.save('theimage.png')

# Convert to numpy array, normalize to [0, 1], and reshape
img_array = np.array(img).reshape(1, 28, 28, 1) / 255.0


# Model prediction
predictions = model.predict(img_array)

top_classes = np.argsort(predictions[0])[-10:][::-1]  # Get the top 10 cases
print(np.argmax(predictions))

print("Top predicted classes:", top_classes)

for num in top_classes:
    print(items[num])
