const url = require('url');

// Note this object is purely in memory
// When node shuts down this will be cleared.
// Same when your heroku app shuts down from inactivity
// We will be working with databases in the next few weeks.
const drinks = {
  'Whiskey Sour': {
    drinkName: 'Whiskey Sour',
    baseIngredient: 'whiskey',
    ingredients: [
      { oz: '2', name: 'Bourbon' },
      { oz: '1', name: 'Simple Syrup' },
      { oz: '0.5', name: 'Lime Juice' },
      { oz: '0.5', name: 'Lemon Juice' },
    ],
  },
  Margarita: {
    drinkName: 'Margarita',
    baseIngredient: 'tequila',
    ingredients: [
      { oz: '2', name: 'Tequila' },
      { oz: '1', name: 'Lime Juice' },
      { oz: '0.75', name: 'Agave Nector' },
      { oz: '0.75', name: 'Triple Sec' },
    ],
  },
  Cosmopolitan: {
    drinkName: 'Cosmopolitan',
    baseIngredient: 'vodka',
    ingredients: [
      { oz: '1.5', name: 'Citrus Vodka' },
      { oz: '1', name: 'Triple Sec' },
      { oz: '0.5', name: 'Lime Juice' },
      { oz: '0.25', name: 'Cranberry Juice' },
    ],
  },
};

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// function to show not found error
const notFound = (request, response) => {
  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 404);
  }
  const responseJSON = {
    message: 'The page you are loolking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

// function to get the users
const getDrinks = (request, response) => {
  // get the search ingredient param
  const parsedUrl = url.parse(request.url, true);
  const { searchIngredient } = parsedUrl.query;

  if (request.method === 'HEAD') {
    return respondJSONMeta(request, response, 200);
  }
  // object holding drinks that have the base ingredient that was searched
  let trimmedDrinks = {};
  // if na or none, use all
  if (searchIngredient === 'na' || !searchIngredient) {
    trimmedDrinks = drinks;
  } else {
    // loop through drinks
    const drinkArray = Object.values(drinks);
    drinkArray.forEach((d) => {
      if (d.baseIngredient === searchIngredient) {
        trimmedDrinks[d.drinkName] = d;
      }
    });
  }
  const responseJSON = {
    drinks: trimmedDrinks,
  };
  return respondJSON(request, response, 200, responseJSON);
};

const addDrink = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name of drink required. Each ingredient must have a oz and name pair. There must be more than 1 ingredient.',
  };

  // make sure each ingredient has a oz name pair
  let unFilledIngredient = false;
  for (let i = 0; i < body.ingredients.length; i++) {
    const ingredient = body.ingredients[i];
    if ((!ingredient.oz && ingredient.name) || (ingredient.oz && !ingredient.name)) {
      unFilledIngredient = true;
      break;
    }
  }

  // get the filled in ingredients into a list
  const trimmedIngredients = [];
  for (let i = 0; i < body.ingredients.length; i++) {
    if (body.ingredients[i].oz && body.ingredients[i].name) {
      trimmedIngredients.push(body.ingredients[i]);
    }
  }

  const badIngredients = (unFilledIngredient || trimmedIngredients.length === 0);
  // give missing params code if, no drink name or, not  filled out ingredient, or no ingredients.
  if (!body.drinkName || !body.baseIngredient || badIngredients) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code to 201 created
  let responseCode = 201;

  // if that user's name already exists in our object
  // then switch to a 204 updated status
  if (drinks[body.drinkName]) {
    responseCode = 204;
  } else {
    // otherwise create an object with that name
    drinks[body.drinkName] = {};
  }
  // ingredients
  // add or update fields for this user name
  drinks[body.drinkName].drinkName = body.drinkName;
  drinks[body.drinkName].baseIngredient = body.baseIngredient;
  drinks[body.drinkName].ingredients = trimmedIngredients;

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  // 204 has an empty payload, just a success
  // It cannot have a body, so we just send a 204 without a message
  // 204 will not alter the browser in any way!!!
  return respondJSONMeta(request, response, responseCode);
};

// exports to set functions to public.
// In this syntax, you can do getCats:getCats, but if they
// are the same name, you can short handle to just getCats,
module.exports = {
  notFound,
  addDrink,
  getDrinks,
};
