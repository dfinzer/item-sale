from flask import Flask
from flask import jsonify
from google.cloud import storage
from google.oauth2 import service_account
from PIL import Image
import os
import mimetypes

GOOGLE_STORAGE_PROJECT = os.environ['GOOGLE_STORAGE_PROJECT']
GOOGLE_STORAGE_BUCKET = os.environ['GOOGLE_STORAGE_BUCKET']

app = Flask(__name__)

DATA = [
    {
        "name": "Andreas M. Antonopoulos Limited Edition & Signed Book (NFT)",
        "description": "A special signed & rare NFT edition of Andreas M. Antonopoulos' Mastering Ethereum. ONLY 50 NFTs to be minted. Commemorate your experience with a piece of history!",
        "sizes": [],
        "colors": []
    },
    {
        "name": "Andreas M. Antonopoulos Limited Edition & Signed Book (NFT)",
        "description": "A special signed & rare NFT edition of Andreas M. Antonopoulos' Mastering Ethereum. ONLY 50 NFTs to be minted. Commemorate your experience with a piece of history!",
        "sizes": [],
        "colors": []
    },
    {
        "name": "Andreas M. Antonopoulos Unsigned Mastering Ethereum"
        "description": ""
    },
    {
        ""
    }
]


@app.route('/api/item/<option_id>/<token_id>')
def item(option_id, token_id):
    option_id = int(option_id)
    token_id = int(token_id)
    num_first_names = len(FIRST_NAMES)
    num_last_names = len(LAST_NAMES)
    creature_name = "%s %s" % (FIRST_NAMES[token_id % num_first_names], LAST_NAMES[token_id % num_last_names])

    base = BASES[token_id % len(BASES)]
    eyes = EYES[token_id % len(EYES)]
    mouth = MOUTH[token_id % len(MOUTH)]

    attributes = []
    _add_attribute(attributes, 'base', BASES, token_id)
    _add_attribute(attributes, 'eyes', EYES, token_id)
    _add_attribute(attributes, 'mouth', MOUTH, token_id)
    _add_attribute(attributes, 'level', INT_ATTRIBUTES, token_id)
    _add_attribute(attributes, 'stamina', FLOAT_ATTRIBUTES, token_id)
    _add_attribute(attributes, 'personality', STR_ATTRIBUTES, token_id)
    _add_attribute(attributes, 'aqua_power', BOOST_ATTRIBUTES, token_id, display_type="boost_number")
    _add_attribute(attributes, 'stamina_increase', PERCENT_BOOST_ATTRIBUTES, token_id, display_type="boost_percentage")
    _add_attribute(attributes, 'generation', NUMBER_ATTRIBUTES, token_id, display_type="number")


    return jsonify({
        'name': creature_name,
        'description': "Friendly OpenSea Creature that enjoys long swims in the ocean.",
        'external_url': 'https://openseacreatures.io/%s' % token_id,
        'attributes': attributes
    })


@app.route('/api/factory/<option_id>')
def factory(option_id):
    option_id = int(option_id)
    data = DATA[option_id]

    return jsonify({
        'name': data['name'],
        'description': data['description'],
        #'image': image_url,
        #'external_url': 'https://openseacreatures.io/%s' % token_id,
        #'attributes': attributes
    })


def _add_attribute(existing, attribute_name, options, token_id, display_type=None):
    trait = {
        'trait_type': attribute_name,
        'value': options[token_id % len(options)]
    }
    if display_type:
        trait['display_type'] = display_type
    existing.append(trait)


def _compose_image(image_files, token_id, path="creature"):
    composite = None
    for image_file in image_files:
        foreground = Image.open(image_file).convert("RGBA")

        if composite:
            composite = Image.alpha_composite(composite, foreground)
        else:
            composite = foreground

    output_path = "images/output/%s.png" % token_id
    composite.save(output_path)

    blob = _get_bucket().blob(f"{path}/{token_id}.png")
    blob.upload_from_filename(filename=output_path)
    return blob.public_url


def _get_bucket():
    credentials = service_account.Credentials.from_service_account_file('credentials/google-storage-credentials.json')
    if credentials.requires_scopes:
        credentials = credentials.with_scopes(['https://www.googleapis.com/auth/devstorage.read_write'])
    client = storage.Client(project=GOOGLE_STORAGE_PROJECT, credentials=credentials)
    return client.get_bucket(GOOGLE_STORAGE_BUCKET)


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)