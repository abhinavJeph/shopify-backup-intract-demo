const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const db = require("./config/mongoose");
const axios = require("axios");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Order = require("./models/Order");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const accessToken = "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";
const limit = 3; // max Limit is 250, for demo purpose it is 3
const shopName = "test-store-intract";
const version = "2022-01";
const url = `https://${shopName}.myshopify.com/admin/api/${version}/`;

const config = {
  headers: {
    "X-Shopify-Access-Token": accessToken,
  },
  params: {
    limit: limit,
  },
};

const parse_link_header = (header) => {
  if (header.length == 0) {
    throw new Error("input must not be of zero length");
  }

  var parts = header.split(",");
  var links = {};
  parts.forEach((p) => {
    var section = p.split(";");
    if (section.length != 2) {
      throw new Error("section could not be split on ';'");
    }
    var url = section[0].replace(/<(.*)>/, "$1").trim();
    var name = section[1].replace(/rel="(.*)"/, "$1").trim();
    links[name] = url;
  });

  return links;
};

const updateOrCreateDoc = async (Model, data) => {
  try {
    var doc = await Model.findOne({ id: data.id });
    if (doc) {
      doc.set(data);
      doc.save();
    } else {
      doc = await Model.create(data);
    }
    return data;
  } catch (error) {
    console.log("Error while inserting doc");
    console.log(error);
  }
};

const getPercentage = (page, count, total) => {
  var perc = (((page - 1) * limit + count) * 100) / total;
  return perc.toFixed(2);
};

const backupShopify = (Model, modelName, field_values) => {
  axios
    .get(url + modelName + "/count.json", config)
    .then(async (res) => {
      var count = res.data.count;
      var pages = Math.ceil(count / limit);
      var link = url + modelName + ".json";

      for (let page = 1; page <= pages; page++) {
        var response = await axios.get(link, config);

        var headersLink = response.headers.link;
        if (headersLink) {
          var links = parse_link_header(headersLink);
          link = links.next; // links contain next and previous
        }

        var models = response.data[modelName];

        for (let idx = 1; idx <= models.length; idx++) {
          var model = models[idx - 1];
          var obj = { id: model.id };
          field_values.forEach((field) => {
            obj[field] = model[field];
          });

          obj.pageDetails = {
            link: link,
            count: idx,
            percentage: getPercentage(page, idx, count),
          };

          var doc = await updateOrCreateDoc(Model, obj);
        }
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

var Model, modelName, field_values;

// Products
Model = Product;
modelName = "products";
field_values = ["title"];
backupShopify(Model, modelName, field_values);

// Customers
Model = Customer;
modelName = "customers";
field_values = ["first_name", "last_name", "email"];
backupShopify(Model, modelName, field_values);

// Orders
Model = Order;
modelName = "orders";
field_values = ["customer_id", "currency", "total_price"];
backupShopify(Model, modelName, field_values);

app.listen(port, (err) => {
  if (err) {
    console.log("Error in connecting the server : " + err);
    return;
  }
  console.log(`Server is up and running on port ${port}`);
});

module.exports = app;
