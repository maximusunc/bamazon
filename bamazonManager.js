var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	start();
});

function start() {
	inquirer.prompt([
	{
		type: "list",
		name: "command",
		message: "Menu:",
		choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"]
	}]).then(function(answer) {
		switch (answer.command) {
			case "View products for sale":
				return sale();
			case "View low inventory":
				return low();
			case "Add to inventory":
				return inventory();
			case "Add new product":
				return product();
			default:
				console.log("I don't know what you did, but kudos.");
				break;
		};
	});
};

function sale() {
	connection.query("SELECT * FROM products", function(error, results, fields) {
		if (error) throw error;
		var table = new Table({
		    head: ['product_id', 'product_name', 'price'],
			colWidths: [15, 15, 15]
		});
		for (var i = 0; i < results.length; i++) {
			table.push(
			    [results[i].item_id, results[i].product_name, results[i].price]
			);
		};
		console.log(table.toString());
		reStart();
	});
};

function low() {
	connection.query("SELECT * FROM products WHERE stock_quantity<=5", function(error, results, fields) {
		if (error) throw error;
		var table = new Table({
		    head: ['product_id', 'product_name', 'stock_quantity'],
			colWidths: [15, 15, 20]
		});
		for (var i = 0; i < results.length; i++) {
			table.push(
			    [results[i].item_id, results[i].product_name, results[i].stock_quantity]
			);
		};
		console.log(table.toString());
		reStart();
	});
};

function inventory() {
	connection.query("SELECT * FROM products", function(error, results, fields) {
		if (error) throw error;
		var table = new Table({
		    head: ['product_id', 'product_name', 'stock_quantity'],
			colWidths: [15, 15, 20]
		});
		for (var i = 0; i < results.length; i++) {
			table.push(
			    [results[i].item_id, results[i].product_name, results[i].stock_quantity]
			);
		};
		console.log(table.toString());
		inquirer.prompt([
		{
			type: "input",
			name: "id",
			message: "What is the product id of the item you would like to add to?"
		}]).then(function(answer) {
			var id = answer.id;
			inquirer.prompt([
			{
				type: "input",
				name: "quantity",
				message: "How much would you like to add?"
			}]).then(function(answer) {
				var quantity = answer.quantity;
				add(id, quantity);
			});
		});
	});
};

function add(id, quantity) {
	connection.query("SELECT stock_quantity FROM products WHERE item_id=?", id, function(error, results, fields) {
		if (error) throw error;
		var newQuantity = results[0].stock_quantity + quantity;
		connection.query("UPDATE products SET ? WHERE ?",
		[{
			stock_quantity: newQuantity
		}, {
			item_id: id
		}], function(error) {
			if (error) throw error;
			console.log("Quantity added!");
			reStart();
		});
	});
};

function product() {
	inquirer.prompt([
	{
		type: "input",
		name: "product",
		message: "What is the name of the product you want to add?"
	}]).then(function(answer) {
		var product = answer.product;
		inquirer.prompt([
		{
			type: "input",
			name: "department",
			message: "What department does it go in?"
		}]).then(function(answer) {
			var department = answer.department;
			inquirer.prompt([
			{
				type: "input",
				name: "price",
				message: "How much does it cost?"
			}]).then(function(answer) {
				var price = answer.price;
				inquirer.prompt([
				{
					type: "input",
					name: "quantity",
					message: "How many are you adding?"
				}]).then(function(answer) {
					var quantity = answer.quantity;
					connection.query("INSERT INTO products SET ?",
					{
						product_name: product,
						department_name: department,
						price: price,
						stock_quantity: quantity
					}, function(error, results, fields) {
						if (error) throw error;
						console.log("Item added!");
						reStart();
					});
				});
			});
		});
	});
};

function reStart() {
	inquirer.prompt([
	{
		type: "confirm",
		name: "confirm",
		message: "Would you like to do something else?"
	}]).then(function(answer) {
		if (answer.confirm) {
			start();
		} else {
			console.log("Goodbye!");
			connection.end();
		};
	});
};

