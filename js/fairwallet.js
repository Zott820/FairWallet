
// ---- Global Variables ---- //

// Tax Calculation Variables
var taxPercentage = 0; 
var splitEquallyBool = false;

// Tip Calculation Variables
var tipUpperRange = 0.20;
var tipLowerRange = 0;
var lowestWorkingTip = 0;
var bankName = 'The Bill';

// Currency Conversions
var scaleFactor = 100; //Changing this will probably just screw up all the calculations right now since they are on a 100 basis. Ideally, the scale factor should always permit 2 decimal places and all other values are in relation to it.
var currency ="$";

//Toggleables
var showTotals = false;
var makeChange = false;

// This Section  Deals with the payOut and addIn clickable functionality of the table, adding and subtracting new wallets, and renaming wallets in the walletList array.
function emptyList( array ) {
	// Set each option to null thus removing it
	while ( array.options.length ) 
	{ array.options[0] = null; }
}

function fillList( box, arr ) {
	for (var i = 0; i < arr.length; i++ ) {
		var option = new Option(arr[i].walletOwner + "  - Total:  "+ currency + (arr[i].total/scaleFactor) ) ;
		// Add to the end of the existing options
		box.options[box.length] = option; }
}

var changeListNumbers = function(select) {
//This is used to refresh the table numbers by their corresponding html ids in the array below
	var wallet = walletList[select.selectedIndex];
	var array = ["twenty", "ten", "five", "one", "quarter", "dime", "nickel", "penny"];
	for (var i=0; i<array.length; i++) {
		var element = document.getElementById(array[i]);
		element.innerHTML = "";
		element.align = "center";
		element.appendChild(document.createTextNode(walletList[select.selectedIndex].denominations[i].quantity));
	}	 
};

var redrawGUI = function() {
	var selectionElement = document.getElementById("walletSelect"); //Change this as needed
	var selected = selectionElement.selectedIndex; // Save the currently selected element before list destroyed.

	emptyList(selectionElement); // Empty the list of options
	fillList(selectionElement, walletList); // Populate list with new options
	selectionElement.selectedIndex = selected; //Reselect what was previously selected
	changeListNumbers(selectionElement); // Fill the denominations table with proper quantities.
    
    $('#walletSelect').selectmenu(); // Initializes
    $('#walletSelect').selectmenu('refresh', true);
};

var clickPicture = function (denominationUnit, action) {
	var selected = document.getElementById("walletSelect").selectedIndex;
	
	if (action == 'add') {
	walletList[selected].addUnit(denominationUnit);
	}
	else if (action == 'subt') {
	walletList[selected].payOut(denominationUnit);
	}
	redrawGUI();
	
};

var editWalletName = function () {
	var selected = document.getElementById("walletSelect").selectedIndex;
	
	value = prompt("Edit Person's Name", walletList[selected].walletOwner );
    if( value && value != bankName ){
        walletList[selected].walletOwner = value;
        redrawGUI();    
    }
};

var createAndDestroyWallets = function (walletMatrix, action) {
	var selectionElement= document.getElementById("walletSelect"); //Change this as needed

		if (action == 'add') {
			var capturedName = prompt("Enter Person's Name:"); //Change this as needed
			if( capturedName ){
			
				walletMatrix.push(new Wallet(capturedName));
                redrawGUI();
				selectionElement.selectedIndex = (walletMatrix.length)-1;
				redrawGUI();
			}
		}
		else if (action == 'subt' && walletMatrix.length>1) {
            confirmDelete = confirm("Are you sure you want to delete " + walletMatrix[ selectionElement.selectedIndex ].walletOwner + "'s wallet?");
            if( confirmDelete ) {
				walletMatrix.splice(selectionElement.selectedIndex,1);
				if (selectionElement.selectedIndex != 0) {
					selectionElement.selectedIndex = (selectionElement.selectedIndex-1);
				}
				redrawGUI(); 
            }
		}
};


//This section handles the second screen containing the individualized tax GUI and the Total Debt for equal split calculations
var calculateTaxPercentage = function () {
	var grandTotal = document.getElementById("totalNoTax").value;
	var taxAmount = $("#taxOnly").val();

			taxPercentage=(1-((grandTotal-taxAmount)/grandTotal));
			
			$("#taxPercent").val(Number(taxPercentage*100).toFixed(2));
};

// This section does some work on the Individual Splitting Screen

var adjustSlidersForDebt = function () {
	var selectionElement = document.getElementById("walletSelect");
	var selected = selectionElement.selectedIndex;

var pureValue = document.getElementById("debtReporting").value;
var inputDebt = (eval(pureValue.replace(/[^-\d/*+.]/g, ''))*scaleFactor);
//Eval is bad for security. 
//However, I didn't feel the implementation didn't need to be as robust as a full-fledged calculator. That's not the purpose.
//Alternatives: 
// http://silentmatt.com/javascript-expression-evaluator/
// http://stackoverflow.com/questions/6479236/calculate-string-value-in-javascript-not-using-eval


walletList[selected].debt = inputDebt;
//New debt has been entered/changed into the debt box. Save it and then move sliders to corrolate.
//There's sort of a loop going on here beween the sliders adjusting for the input and vice versa. Any Input gets sanitized to a possible ##.## formation by the slider values, which appear to fire off right after.
//This prevents adding negative values and the possibility of using eval results.
printFooterTotals();
};

var iterateThroughWalletList = function (direction) {
	var selectionElement = document.getElementById("walletSelect"); //Change this as needed
//This uses index from the select menu from the earlier page. This allows for application for both purposes, 
//and allows for moving back to the old page but keeping the same wallet selected for other purposes.

	if (direction=="forward") {
		if (selectionElement.selectedIndex + 1  >= walletList.length || selectionElement.selectedIndex + 1 == undefined) {
			selectionElement.selectedIndex = 0; } 
		else {
			selectionElement.selectedIndex = (selectionElement.selectedIndex + 1); }
	}
	if (direction =="backward") {
		if (selectionElement.selectedIndex -1 < 0 || selectionElement.selectedIndex - 1 == undefined) {
			selectionElement.selectedIndex = walletList.length - 1; }
		else {
		selectionElement.selectedIndex = (selectionElement.selectedIndex - 1); }
	}
	redrawGuiTax();
};

var printFooterTotals = function () {
	var selectionElement = document.getElementById("walletSelect"); //I'm thinking I should have made this a global variable because I call it so much, and the element isn't going to change...
	var selected = selectionElement.selectedIndex;
	taxPercentage = (document.getElementById("taxPercent").value);
	
	document.getElementById("debtTaxed").innerHTML = "<b>This Debt @ " + Number(taxPercentage).toFixed(2) + "% Tax </b>: "+ currency + ((walletList[selected].debt/scaleFactor)*((taxPercentage/scaleFactor)+1)).toFixed(2)
                                                     +"<hr><b>Group Subtotal w/o Tax</b>: "+ currency + (sumWalletDebt(walletList)/scaleFactor).toFixed(2);
	document.getElementById("grandTotal").innerHTML = "<b>Group Grand Total:</b> "+ currency + ((sumWalletDebt(walletList)/scaleFactor)*((taxPercentage/scaleFactor)+1)).toFixed(2);
    

};

var redrawGuiTax = function () {
	var selectionElement = document.getElementById("walletSelect"); //Change this as needed
	var selected = selectionElement.selectedIndex;
	
document.getElementById("walletNameSpot").innerHTML = walletList[selected].walletOwner + " spent:"; // Draw name on screen.
document.getElementById("debtReporting").value = (walletList[selected].debt/scaleFactor); // Draw new Debt
adjustSlidersForDebt(); //Adjust the sliders to the new debt value.
printFooterTotals(); // Reprint the footer at the bottom of the screen.
};

// This Section handles most of the major calculations.

// ---- Objects ---- //

// Units of cash (denominations)
var Unit = function(value, quantity) {
    this.denomination = value;
	this.quantity = quantity;
 
    this.getValue = function() {
        return (this.denomination);
		};
};

//Denomination Variables
quickTwenty = new Unit(2000, 1);
quickTen = new Unit(1000, 1);
quickFive = new Unit(500, 1);
quickOne = new Unit(100, 1);
quickQuarter = new Unit(25, 1);
quickDime= new Unit(10, 1);
quickNickel = new Unit(5, 1);
quickPenny = new Unit(1, 1);


allDenominationsArray = new Array(
        new Unit(2000, 0),
        new Unit(1000, 0),
        new Unit(500, 0),
        new Unit(100, 0),
		new Unit(25, 0),
		new Unit(10, 0),
		new Unit(5, 0),
		new Unit(1, 0) );


// Wallet objects 
walletList = new Array();
var Wallet = function (walletOwner) {

    this.walletOwner = walletOwner;
    this.total = 0;
    this.debt = 0;

    this.denominations = new Array(
        new Unit(2000, 0),
        new Unit(1000, 0),
        new Unit(500, 0),
        new Unit(100, 0),
        new Unit(25, 0),
        new Unit(10, 0),
        new Unit(5, 0),
        new Unit(1, 0) );


    this.addUnit = function( unitObj ) {
        for (var k in this.denominations) {
            var testbill = this.denominations[k];
            if (testbill.getValue()==unitObj.getValue()) {
                testbill.quantity+=1;
                this.total += unitObj.getValue();
            }
        }
    };

    this.payOut = function( unitObj ) {
        for (var k in this.denominations) {
            var testbill = this.denominations[k];
            if (testbill.getValue()==unitObj.getValue() ) {
                if (this.walletOwner !=bankName && testbill.quantity>0) {
                    testbill.quantity-=1;
                    this.total -= unitObj.getValue();
                } else if (this.walletOwner == bankName) {
                    testbill.quantity-=1;
                    this.total -= unitObj.getValue();
                }
            }
        }
    };

    this.sumDenoms = function () {
        var sum=0;
        for ( var p in this.denominations) {
            sum+= this.denominations[p].quantity;
        }
        return sum;
    };
};

//Debug stuff
person1 = new Wallet('Person #1');
walletList.push(person1);
Bank = new Wallet(bankName); // Bank just acts like a wallet, but will have negative debt.

var transferDenomination = function (walletPay, walletRecieve, denominationUnit) {
	walletPay.payOut(denominationUnit);
	walletRecieve.addUnit(denominationUnit);
	walletPay.debt -= denominationUnit.getValue(); 
	if (walletRecieve != Bank) {
	walletRecieve.debt+=denominationUnit.getValue(); }
	else {
	walletRecieve.debt-=denominationUnit.getValue(); }
	
	//console.log( walletPay.walletOwner + ' gives $' + denominationUnit.getValue() + ' to ' + walletRecieve.walletOwner);
	//console.log( walletPay.walletOwner + ' now has a debt of ' + walletPay.debt)
	//console.log( walletRecieve.walletOwner + ' now has a debt of ' + walletRecieve.debt)
};

var walletsEqualDenom = function (walletList1,walletList2) {
	//Check if two wallets have equivalent denomination contents. Does not compare debt, names or anything else.
		
    if(typeof walletList1 === 'undefined' || typeof walletList2 === 'undefined') {
		return false
	}
	
    if (walletList1.length == walletList2.length) {
		for (var i = 0; i < allDenominationsArray.length; i++) {
			if (walletList1.denominations[i].quantity != walletList2.denominations[i].quantity ) { 
				return (false) 
				}
		}
    return(true);
	}
	
	//Default false if wallets not equal length
	return (false)
}

var sumWalletDebt = function ( walletArray ) {
var sum=0;
	for ( var element in walletArray){
		sum+= walletArray[element].debt;
		}
	return sum;
};

var sumWalletDebtAbs = function ( walletArray ) {
var sum=0;
	for ( var element in walletArray){
		sum+= Math.abs( walletArray[element].debt);
		}
	return sum;
};

var sumWalletDenomCountList = function ( walletArray ) {
	//Given a wallet list, return the sum of all the denominations within it.
var sum=0;
	for ( var element in walletArray){
		sum+= Math.abs( walletArray[element].sumDenoms() );
		}
	return sum;
};

var randomizeWalletDenoms = function ( walletArray ) {
	//Generate a Wallet with a random count of denominations in it.
for (var i = 0; i < allDenominationsArray.length; i++) {
        for (var j = 0; j<walletArray.length; j++) {
			for (var p =0; p<Math.floor( Math.random()*5 ); p++) {
				walletArray[j].addUnit(allDenominationsArray[i]);
            }
        }
    }
};

var compareDenomCountList = function (walletList1,walletList2) {
	//Compare if two wallets have the same total sum in them. Returns difference.
    //Lists need to be the same length
    var dist = Infinity
    if (walletList1.length==walletList2.length) {
        for ( var t in walletList1) {
            var dist = Math.abs(walletList1[t].sumDenoms() - walletList2[t].sumDenoms() );
        }
    }
    return(dist);
}
//Sorting Functions
var sortDebtAscending = function (arrayToSort) {
	arrayToSort.sort(function(a,b) {
	return a.debt-b.debt;
	});
};

var sortDebtDescending = function (arrayToSort) {
	arrayToSort.sort(function(a,b) {
	return b.debt-a.debt;
	});
};

var sortWalletOwner = function (arrayToSort) {
function compare(a,b) {
var nameA = a.walletOwner.toLowerCase();
var nameB = b.walletOwner.toLowerCase();
  if (nameA < nameB) { return -1; }
  if (nameA > nameB) { return 1; }
  return 0;
}
arrayToSort.sort(compare);
};

var sortDenominationQuantityDescending = function (arrayToSort,sortInPoint) {
function compare(a,b) {
var quantityA = 0;
var quantityB = 0;
	for (var i = sortInPoint; i < allDenominationsArray.length; i++) {
			quantityA += a.denominations[i].quantity;
			quantityB += b.denominations[i].quantity;
	}
  if (quantityA < quantityB) { return -1; }
  if (quantityA > quantityB) { return 1; }
  return 0;
}
arrayToSort.sort(compare);
};


var consistantRandom = Math.floor( Math.random() * walletList.length );

var State ={
    
    // Make sure walletList is never zero length here
    splitEqually: function( amountOwed ){
        // split amount owed
        var splitAmount = Math.floor(amountOwed / walletList.length);
        
        // split cost evenly among all the wallets
        for (var element in walletList ){
		wallet=walletList[element];
		wallet.debt=splitAmount;
        }

        // get random people to pay the one cent differences    
        while ( sumWalletDebt(walletList) - amountOwed < 0){
            var chosenOne = walletList[ Math.floor( Math.random() * walletList.length ) ];        
            chosenOne.debt+=1;
        }  
    },
    
    // Split for what they paid with Tax
    splitFairlyPercentage: function( percentage ) { //It says percentage but you have to put it in decimal form. Like what a percentage really is
        for (var element in walletList ) {
			wallet=walletList[element];
            var addAmount = Math.floor( (percentage) * wallet.debt);
            wallet.debt += addAmount;
			
        }
            Bank.debt +=Math.floor( (percentage) * Bank.debt );
   
        // Choose one person randomly but consistently because it will need to be consistent for calculations with the tip where the function is used multiple times.
         while ( sumWalletDebt(walletList) - Bank.debt < 0){
             var chosenOne = walletList[ consistantRandom ];        
             chosenOne.debt+=1;
         }		
    }
};
//Iterative Beginnings (Unfinished/Untested as of 02/05/17)
var IterativeSolveSetup = function () {
			payToBank();
//This is a "Random" solve, so not a true iteration through every possibility.

//Transfer all denominations to a temporary wallet.
//Should have already transferred to bank first, so this is about minimizing the remaining moves.
//Later I would like this to ignore some of the denominations that are transfered via the more efficient algorithm.
    var storeDenoms = new Wallet("storeDenoms");
	var finalConfig = copyArray(walletList); // Stores original composition of wallet initially in case no changes occur

    for (var i = 0; i < allDenominationsArray.length; i++) {
        for (var j = 0; j<walletList.length; j++) {
            while (walletList[j].denominations[i].quantity>0) {
                transferDenomination(walletList[j], storeDenoms, allDenominationsArray[i]);
            }
        }
    }
    //All denominations have been transferred to the storageWallet.

    var IterativeSolve = function (passedWalletList, passedDenominationsArray) {
		//Save the wallet list as it exists at this point into temporary variables.
		for (var i = 0; i < allDenominationsArray.length; i++) {
			//See which denominations are left in the passed walletList, then randomly assign
			while (passedDenominationsArray.denominations[i].quantity>0) {
				transferDenomination(passedDenominationsArray,  passedWalletList[Math.floor(Math.random()*passedWalletList.length)], allDenominationsArray[i]);
			}
		}	
		
		//After All bills are randomly assigned.
		{
			stepCount+=1;
            //check if absolute debts within wallets is lower than previous lowest. Also that making change doesn't lead to more bills than needed for the job. If so, we want to save that wallet configuration.
			//Alas, this random movement means that the contents of your wallet get jumbled even if they don't solve the problem. IE you get traded two 5s for 1 10, even if it wasn't used to pay anything.
            if (sumWalletDebtAbs(passedWalletList) <remainderComparison) {
                //console.log("Before   " + "  Remainder: " + remainderComparison +"  Step " + stepCount)
				remainderComparison=sumWalletDebtAbs(passedWalletList);  //Use the remainder comparison here as the final product.
				finalConfig = copyArray(passedWalletList);
				//console.log("After   " + "  Remainder: " + remainderComparison + "  Step " + stepCount)
            }

		}
    };
	
    var stepCount = 0;
	var remainderComparison = sumWalletDebtAbs(finalConfig); //Do better than nothing/greedy
	var preRandWalletList = copyArray(walletList);
    var preRandDenoms = copyArray(storeDenoms);
			for (m=0; m<1000; m++) {

		copyBackWalletList(walletList,preRandWalletList);
		copyBackWalletSingle(storeDenoms,preRandDenoms);
		IterativeSolve(walletList,storeDenoms)
		        }

	copyBackWalletList(walletList,finalConfig);
};

//Recursion Attempt - Not a confirmed working method
var recursiveSolveSetup = function () {
		payToBank();
		
//Transfer all denominations to a temporary wallet.
//Should have already transferred to bank first, so this is about minimizing the remaining moves.
//Later I would like this to ignore some of the denominations that are transferred via the more efficient algorithm.
    var stepCount = 0;
	var remainderComparison = sumWalletDebtAbs(walletList); //Must be better than doing Greedy Solve
	var movementComparison = Infinity;
	
	//Array of wallets
	treeStore = new Array();
	//Array of best values per node level
	nodeStore = new Array(sumWalletDenomCountList(walletList)).fill(Infinity);
	
	
	var storeDenoms = new Wallet("storeDenoms");
	var finalConfig = copyArray(walletList); // Stores original composition of wallet
    //Original walletList already should be backed up, so can free mess with the wallet contents before each backup.

    for (var i = 0; i < allDenominationsArray.length; i++) {
        for (var j = 0; j<walletList.length; j++) {
            while (walletList[j].denominations[i].quantity>0) {
                transferDenomination(walletList[j], storeDenoms, allDenominationsArray[i]);
            }
        }
    }
    //All denominations have been transferred to the storageWallet.
	

	
	
	var checkTreeDupe = function (walletToCompare) {
		//Less unique denominations we're interested in are likely at the end
		for (var i = treeStore.length -1; i >= 0; i--) { 
			if  ( walletsEqualDenom(treeStore[i],walletToCompare) ) {
			return (true)
			}
		}
		//If not included in the tree, let's add it.
		treeStore.push(copyArray(walletToCompare))
		return (false)
	}
	
	var checkTreeDupeList = function (walletListToCompare) {
		//Less unique denominations we're interested in are likely at the end

		for (var i = treeStore.length -1; i >= 0; i--) {
			var equalBool = false;
			//Moving through wallet lists. Check each set of wallets, against default not equal
			nextList:
			for (var j = treeStore[i].length - 1; j >= 0; j--) {
				//For each wallet in that wallet list
				for (var k = walletListToCompare.length - 1; k >= 0; k--) {
					//comparing against other wallet list
					if (treeStore[i][j].walletOwner == walletListToCompare[k].walletOwner) {
						//Find the wallet with the same name, let's not compare the wrong wallets
						if (treeStore[i][j].total == walletListToCompare[k].total) {
						//If the total isn't the same, there are no same wallets
							if ( walletsEqualDenom(treeStore[i][j],walletListToCompare[k]) == true ) {
							//Let's compare the denominations inside the wallets.
								equalBool = true
							} else {equalBool = false; break nextList } //Denom Check
						} else {equalBool = false; break nextList} //Total Check
					}
				}
			//Did we make it through both wallets? It should cancel early otherwise
			}	
			if (equalBool == true) {
				return(true)
			}			
		}
		
		//If List not included in the tree, let's add it.
		treeStore.push(copyArray(walletListToCompare))
		return (false)
	}
	
// The issue with this recursion is it does more work than required.
//For example, in a 3x2 situation, there are only 9 unique outcomes, but all orders are tested, so it actually does 18 calculations
// That depend on which denomination was chosen first to work with.
    var recursiveSolve = function (passedWalletList, passedDenominationsArray, level, nodeBest) {
        if (passedDenominationsArray.sumDenoms()>=1) {
            for (var i = 0; i < allDenominationsArray.length; i++) {
			//Denoms to give out
                //See which denominations are left in the passed walletList
                if (passedDenominationsArray.denominations[i].quantity>0) {
						var copiedrecursWalletList = copyArray(passedWalletList);
						var copiedDenoms = copyArray(passedDenominationsArray);

						//Save the wallet list as it exists at this point into temporary variables.
						for (var m=0; m<passedWalletList.length; m++) {
							//move down the chain, and restore previous wallet list config, move denomination into position +1
							transferDenomination(passedDenominationsArray, passedWalletList[m], allDenominationsArray[i]);

							
							var speedyTempVarWalletSum = sumWalletDebtAbs(passedWalletList)
							if (speedyTempVarWalletSum <=nodeBest && speedyTempVarWalletSum<=nodeStore[level]  ) {
							console.log("Old Node: " + nodeBest, level);
							nodeStore[level] = speedyTempVarWalletSum;
							console.log("New Node: " + nodeBest, level);
							//Don't save the hand-out if it is worse than the node above. :( 

							//Will need to compare the WalletLists and bail if a WalletList is a duplicate. 10/19/20
								if (checkTreeDupeList(passedWalletList) == false) {
									//checkTreeDupeList(passedWalletList)
									recursiveSolve(passedWalletList,passedDenominationsArray, level + 1,sumWalletDebtAbs(passedWalletList));
								}
							}
							//console.log("New Best: " + remainderComparison);
							copyBackWalletList(passedWalletList,copiedrecursWalletList);
							copyBackWalletSingle(passedDenominationsArray,copiedDenoms)
							//console.log("Level Count: " + level);
						}
                }

                //Save denominations list
            }
        } else {
			stepCount+=1;
			console.log("Node Best: " + nodeBest, level);
            // IF there are no more denominations to move:
            //check if lower than previous lowest. If so, we want to save that wallet configuration.
            if (sumWalletDebtAbs(passedWalletList) <remainderComparison &&  compareDenomCountList(passedWalletList,walletList)<=movementComparison ) {
                console.log("Old Best: " + remainderComparison);
				remainderComparison=sumWalletDebtAbs(passedWalletList);  //Use the remainder comparison here as the final product.
                finalConfig = copyArray(passedWalletList);
				console.log("New Best: " + remainderComparison);
            }
            //Went through all denominations and no quantities are greater than 0, abort this branch.
            return(1);
        }
    };

    recursiveSolve(walletList,storeDenoms, 0,Infinity);
	copyBackWalletList(walletList,finalConfig);
	console.log("Step Count: " + stepCount);
};

//FIRST PASS -> Pay to Bank ONLY
var payToBank = function () {
// This chooses the wallet with the least 'flexibility' that is, the wallet with the fewest quantity of denominations to be first pick per each tier of denomination, though only if they have the item.
//IE, if everybody has 20s to spare, take it from the guy who doesn't have any 10s next because they have fewer ways to pay off any high amount inequalities generated later. 
	for (var i = 0; i < allDenominationsArray.length; i++) {
		sortDenominationQuantityDescending(walletList,i+1); //Count only denominations/flexibility below current denomination level
		for (var j=0; j<walletList.length; j++) {
			while (Bank.debt>=allDenominationsArray[i].getValue() && walletList[j].denominations[i].quantity>0 && Bank.debt!=0) {
			transferDenomination(walletList[j], Bank, allDenominationsArray[i]);
			}
		}
	}
};

//SECOND PASS -> Negative Means they overpaid, get paid by everybody below them.
var payOverpaid = function () {
	sortDebtAscending(walletList);
	for (var m=0; m<walletList.length; m++) { //Receiving Wallets
		if (walletList[m].debt<=-1) {
			for (var i=0; i<allDenominationsArray.length; i++) {
				for (var j=m+1; j<walletList.length; j++) { //Sending Wallets
					while (walletList[m].debt<=-allDenominationsArray[i].getValue() && walletList[j].denominations[i].quantity>0 && walletList[m].debt!=0) {
					transferDenomination(walletList[j], walletList[m], allDenominationsArray[i]);
					}
				}
			}
		}
	}
};

//THIRD PASS -> Positive Debt means they have not yet paid enough, give away denominations
var payUnderpaid = function () {
	sortDebtDescending(walletList);
	for (var m=0; m<walletList.length; m++) { //Sending Wallets
		if (walletList[m].debt>=1) {
			for (var i=0; i<allDenominationsArray.length; i++) {
				for (var j=m+1; j<walletList.length; j++) { //Receiving Wallets
					while (walletList[m].debt>=allDenominationsArray[i].getValue() && walletList[m].denominations[i].quantity>0 && walletList[m].debt!=0) {
					transferDenomination(walletList[m], walletList[j], allDenominationsArray[i]); 
					}
				}
			}
		}
	}
};

var copyArray = function( toCopy ) {
    var backupCopyString = JSON.stringify( toCopy );
    var copied = JSON.parse( backupCopyString );
	return (copied);
};

var greedySolve = function () {
	payToBank();
	payOverpaid();
	payUnderpaid();
	//console.log("Traditional");
}

var mainAlgorithm = function () {
if (true) {
greedySolve();
recursiveSolveSetup();
console.log("Recursive");
} else {
	IterativeSolveSetup();
	//greedySolve();
	console.log("Running Main")
}
};

// MAKING CHANGE CODE
var bankChangeMaker = function () {
	
	sortDebtDescending(walletList);  //By the time the wallets reach this point, the flexibility should have been used up if it could have anyway, so target the largest debts, which are indirectly the most inflexible.
	for (var m=0; m<walletList.length; m++) { //Sending Wallets
		if (walletList[m].debt>=1) {
			for (var i=allDenominationsArray.length-1; i>=0; i--) {
				if (walletList[m].debt<=allDenominationsArray[i].getValue() && walletList[m].denominations[i].quantity>0) {
							changeRatiosBank(walletList[m], allDenominationsArray[i]);
							return(true);
				}
			}
		}
	}
};

var changeRatiosBank = function (inputWallet, inputDenomination) { 

	if (inputDenomination.getValue()==quickTwenty.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		for (var b=0; b<2; b++ ) {
			inputWallet.addUnit(quickTen);
			Bank.payOut(quickTen);
		}
	}
	else if (inputDenomination.getValue()==quickTen.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		for (var b=0; b<2; b++ ) {
			inputWallet.addUnit(quickFive);
			Bank.payOut(quickFive);
		}
	}
	else if (inputDenomination.getValue()==quickFive.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		for (var b=0; b<5; b++ ) {
			inputWallet.addUnit(quickOne);
			Bank.payOut(quickOne);
		}
	}
	else if (inputDenomination.getValue()==quickOne.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		for (var b=0; b<4; b++ ) {
			inputWallet.addUnit(quickQuarter);
			Bank.payOut(quickQuarter);
		}
	}
	else if (inputDenomination.getValue()==quickQuarter.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		
		inputWallet.addUnit(quickNickel);
		Bank.payOut(quickNickel);
		for (var b=0; b<2; b++ ) {
			inputWallet.addUnit(quickDime);
			Bank.payOut(quickDime);
		}
	}
	else if (inputDenomination.getValue()==quickDime.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		for (var b=0; b<2; b++ ) {
			inputWallet.addUnit(quickNickel);
			Bank.payOut(quickNickel);
		}
	}
	else if (inputDenomination.getValue()==quickNickel.getValue() ) {
		inputWallet.payOut(inputDenomination);
		Bank.addUnit(inputDenomination);
		for (var b=0; b<5; b++ ) {
			inputWallet.addUnit(quickPenny);
			Bank.payOut(quickPenny);
		}
	}	
};

var tipCycle = function () {

//Hey, next time, let's explore matrix math instead of these different algorithmns. :) 04/29/2018

copiedWalletList = copyArray(walletList); // Stores original composition of wallet
copiedBank = copyArray(Bank); // Stores original composition of Bank

var walletRemainderComparison = Infinity;
var bankRemainderComparison = Infinity;
var movementComparison = Infinity;

var bestWalletList = copyArray(walletList); //Stores best tip arrangement of wallets
var bestBank = copyArray(Bank);

	for (workingTip=tipLowerRange; workingTip<=tipUpperRange; workingTip+=0.0001) {

		copyBackWalletList(walletList,copiedWalletList);
		copyBackWalletSingle(Bank,copiedBank);
		State.splitFairlyPercentage(workingTip);
		
		//We'll try and make change inside the tip loop. Otherwise we'll spend time trying to find the best tip, only to wreck all the work when we ultimately need to make change.
		if (makeChange) {
			mainAlgorithm();
			var antiFreeze = 0;
			while (bankChangeMaker() && antiFreeze<20) {
				greedySolve(); //There is no need to run other expensive algorithmns because the bank will ALWAYS eventually allow you to pay off the debt. The person doing the exchange may not be ideal though.
				antiFreeze = antiFreeze + 1;
				console.log("Anti-Freeze :" + antiFreeze);
				}
		} else {
			mainAlgorithm();
		}
		
		//Previous method used bank.debt<1 which means there is nothing less than a penny left in the bank. Ideal, but not realistic for performance. Bank debt should already be as close to 0 as it can go anyways.
			if (sumWalletDebtAbs(walletList)<walletRemainderComparison && Bank.debt<bankRemainderComparison && sumWalletDenomCountList(walletList)<=movementComparison ) {
			//console.log (workingTip);
			console.log("Before   " + "  Wallet Remainder: " + walletRemainderComparison +"  Bank Remainder " + bankRemainderComparison + "  Movement : " + movementComparison)
			copyBackWalletList(bestWalletList,walletList);
			copyBackWalletSingle(bestBank,Bank);
			walletRemainderComparison=sumWalletDebtAbs(walletList);
			bankRemainderComparison = Bank.debt;
			movementComparison = sumWalletDenomCountList(walletList);
			console.log("After   " + "  Wallet Remainder: " + walletRemainderComparison +"  Bank Remainder " + bankRemainderComparison + "  Movement : " + movementComparison)
			}
	}
	
	//Run one final time with the lowest tip found using the above for loop.
	
	copyBackWalletList(walletList,bestWalletList);
	copyBackWalletSingle(Bank,bestBank);
	

	
//console.log('Lowest Working Tip ' + (lowestWorkingTip*scaleFactor).toFixed(2));
};

var copyBackWalletList = function (target, origin) {
//wallet owners should not change, so this will align the origin and target matrices so they are in the same order. They should be the same size too.
if (target.length>=1 && origin.length>=1) {
sortWalletOwner(target);
sortWalletOwner(origin);
}

// We need to replace the Denominations, total and debt of the original WalletList back with the copied WalletList
		for (var counting in origin ) {
			var originIndex = origin[counting];
			var targetIndex = target[counting];
			if (originIndex.walletOwner == targetIndex.walletOwner) { // Minor check for proper replacement
				for (var unit in originIndex.denominations ) {
					var originUnitIndex = originIndex.denominations[unit];
					var targetUnitIndex = targetIndex.denominations[unit];
					if (originUnitIndex.denomination == targetUnitIndex.denomination) { // Minor check for proper replacement
						targetUnitIndex.quantity = copyArray(originUnitIndex.quantity);
					}
					else
					{
					console.log('Fail Replacement OriginIndex');
					}
				}
			targetIndex.debt = copyArray(originIndex.debt);
			targetIndex.total = copyArray(originIndex.total);
			}
			else
			{
			console.log('Fail Replacement UnitIndex');
			}
		}			
};

var copyBackWalletSingle = function (target, origin) {
	if (origin.walletOwner == target.walletOwner) { // Minor check for proper replacement
		for (var unit in origin.denominations ) {
			var originUnitIndex = origin.denominations[unit];
			var targetUnitIndex = target.denominations[unit];
				if (originUnitIndex.denomination == targetUnitIndex.denomination) { // Minor check for proper replacement
					targetUnitIndex.quantity = copyArray(originUnitIndex.quantity);
				}
				else
					{
					console.log('Fail Replacement UnitIndex');
					}
			}
		target.debt = copyArray(origin.debt);
		target.total = copyArray(origin.total);
	}
	else
		{
		console.log('Fail Replacement SingleWalletIndex');
		}				
};

var runTaxTipPrint = function () {

tipCycle();

//Sorting Ensures the wallets compare the correct denominations
sortWalletOwner(walletList);
sortWalletOwner(copiedWalletList);
printTable();
};

// Stolen from here http://tinyurl.com/stolenlink
// This Section handles the printing of the final table


// append row to the HTML table
function appendTitle(rowLength,contentMatrix,columnPosition) {
    var tbl = document.getElementById('resultsTable'); // table reference
    // insert table cells to the new row
    for (var i = 0; i < rowLength; i++) {
		var row = tbl.insertRow(tbl.rows.length); // append table row
        createCell(row.insertCell(columnPosition), contentMatrix[i], 'title');
    }
}
 
// create DIV element and append to the table cell
function createCell(cell, text, style) {
    var div = document.createElement('div'), // create DIV element
        txt = document.createTextNode(text); // create text node
    div.appendChild(txt);                    // append text node to the DIV
    div.setAttribute('class', style);        // set DIV class attribute
    div.setAttribute('className', style);    // set DIV class attribute for IE (?!)
    cell.appendChild(div);                   // append DIV to the table cell
	cell.setAttribute('class', style);        // set DIV class attribute
    cell.setAttribute('className', style);    // set DIV class attribute for IE (?!)
	cell.appendChild(div); 
}

var printTable = function () {
	// http://www.redips.net/javascript/adding-table-rows-and-columns/
	var titles =  ["Owner", "$20","$10","$5","$1","25¢","10¢","5¢","1¢","Debt","Paid","Remaining Debt"];
	appendTitle(titles.length,titles,0); //Fixes the number of Rows

	walletColumnGen(Bank,copiedBank);
	for ( var element in walletList ) {
		var wallet=walletList[element];
		var initialWallet = copiedWalletList[element];
        walletColumnGen(wallet,initialWallet); }
	document.getElementById('tip').innerHTML = 'Calculated Optimal Tip ' + (lowestWorkingTip*scaleFactor).toFixed(2) + '%'; 
	
	$.mobile.loading('hide');
	$("#calculating").hide();
	};

var emptyZeros = function (checkedItem) {
	if (!(checkedItem>0)) {
		return (""); }
	else {
		return (checkedItem); }
};

var walletColumnGen = function(wallet, initialWallet) {
		var tbl = document.getElementById('resultsTable'); // table reference
		var lastColumn = function(i, item, style) {
		createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), item, style); // Add item to last column of row i
		};
		
		lastColumn(0,wallet.walletOwner,'name'); // Add Wallet Name Column
		 
		for (var k=0; k<wallet.denominations.length; k++) { //Add Denomination Columns
		
			if (showTotals) {
					lastColumn(k+1,emptyZeros(wallet.denominations[k].quantity),""); } 
			else {
				var output = printComparisons(initialWallet.denominations[k].quantity,wallet.denominations[k].quantity, 1);
				var readability = output[0] + output[1];
				lastColumn(k+1,readability,output[2]);
			}
		}
		
		
		//Totals Owed - Do the scale factor last to avoid floating rounding errors for some reason.
		var owedTotal = ((initialWallet.total-wallet.total) + wallet.debt)/scaleFactor;
		lastColumn(k+1,currency + ' ' + owedTotal,'total');
		 
		if (wallet != Bank) {
			var compare = (initialWallet.total-wallet.total)/scaleFactor;
				if (compare == 0) {
					var walletPaid = currency + ' 0'; }
				else {
					var walletPaid = currency + ' ' + compare; }
		}
		else {var walletPaid = currency + ' ' + (wallet.total/scaleFactor).toFixed(2); }
		lastColumn(k+2,walletPaid,'total');
		 
		if (wallet.debt<=-1 && wallet != Bank || wallet.debt>=-1 && wallet == Bank)
			{var temp = currency + ' ' + Math.abs((wallet.debt/scaleFactor)) + ' Needed';
			lastColumn(k+3,temp,'overDebt'); }
		else if (wallet.debt>=1 && wallet != Bank || wallet.debt<=-1 && wallet == Bank)
			{var temp = currency + ' ' + Math.abs((wallet.debt/scaleFactor)) + ' Owed';
			lastColumn(k+3,temp,'underDebt');
		}
		else
			{var temp = currency + ' ' + Math.abs((wallet.debt/scaleFactor));
			lastColumn(k+3,temp,'neutralDebt');
		}
};

var printComparisons = function ( initialWalletCriteria, finalWalletCriteria, scaling) { 

difference = initialWalletCriteria - finalWalletCriteria;

	if (difference != 0) {
		if (difference < 0) { // Gained Bills
			var operator = '+';
			var value = Math.abs(difference)/scaling;
			var action = 'gainBill';
			return ( [operator,value,action] ); 
		}	
		if (difference > 0) { //Lost Bills
			var operator = '-';
			var value = Math.abs(difference)/scaling;
			var action = 'loseBill';
			return ( [operator,value,action] ); 
		}
	}
	return(["","",""]);
};

var restartTable = function (tableIdString) {
	var table = document.getElementById(tableIdString);
	table.innerHTML="";
	
$("#calculating").show();
$.mobile.loading('show');
};

var toggleTotals = function () {
	if (!showTotals) {
		showTotals=true; 
		$('#displayButton').text('Showing Quantities');
//		$("#displayButton").button("refresh");
		}
	else {
		showTotals=false;
		$('#displayButton').text('Showing Trades');
//		$("#displayButton").button("refresh");
		}
		
restartTable('resultsTable');
printTable();

};

var toggleChange = function () {
	if (!makeChange) {
		makeChange=true;
				$('#makeChangeCheckbox').text('Make Change is ON');
		}
	else {
		makeChange=false;
		$('#makeChangeCheckbox').text('Make Change is OFF');
		}
};

var restartMethod = function () {
restoreOriginalValues();

consistantRandom = Math.floor( Math.random() * walletList.length );
equalSplitSteps();
unevenSplitSteps();

runTaxTipPrint();
};

var restoreOriginalValues = function () { 
restartTable('resultsTable');
copyBackWalletList(walletList,unmodifiedWalletList); //Restore Original Values of Wallet (Post split)
copyBackWalletSingle(Bank,unmodifiedBank); //Restore Original Values of Bank (Post split)

// Capture new Tips from GUI
tipPerformance();
};

var tipPerformance = function () {
tipUpperRange = (parseFloat(document.getElementById('upperTip').value)/100);
tipLowerRange = (parseFloat(document.getElementById('lowerTip').value)/100);

if ((Math.abs(tipUpperRange-tipLowerRange))>=2) {
	alert('The chosen tip range is too wide and has been adjusted.');
	tipUpperRange = (tipLowerRange + 1);
	document.getElementById('upperTip').value= tipUpperRange*100;
	}
};

var firstRun = function () {

restartTable('resultsTable');

unmodifiedWalletList = copyArray(walletList); // Stores original composition of wallet before modifying with Tax or Tip
unmodifiedBank = copyArray(Bank); // Stores original composition of Bank before modifying with Tax or Tip

consistantRandom = Math.floor( Math.random() * walletList.length );
// Capture new Tips from GUI
tipPerformance();

equalSplitSteps();
unevenSplitSteps();

runTaxTipPrint(); 

};

var equalSplitSteps = function () {

	if (splitEquallyBool == true) {
		Bank.debt = parseFloat((document.getElementById("totalWithTax").value)*scaleFactor);
		State.splitEqually(Bank.debt); }
};

var unevenSplitSteps = function () {

	if (splitEquallyBool == false) {
		taxPercentage = (document.getElementById("taxPercent").value/100);
		Bank.debt = sumWalletDebt(walletList);
		State.splitFairlyPercentage(taxPercentage); }
};

var testSuite = function () {
	
	firstRun()
	
	restartMethod()
	
}


// OnClick and Load Events

$( document ).on("pageshow", "#individualDebts", function() {
    redrawGuiTax(); });

$( document ).on("pageshow", "#fillWallets",  function() {
     redrawGUI(); });

$( document ).on("pageshow", "#results",  function() {
    firstRun(); });
	
	
	//Wallet Contents - OnClick Events
	$('#walletSelect').change(function(){navigator.vibrate(100); redrawGUI(); });
		
	$('#addPerson').click(function(){navigator.vibrate(100); createAndDestroyWallets(walletList,'add'); });
	$('#editPerson').click(function(){navigator.vibrate(100); editWalletName(); });
	$('#deletePerson').click(function(){navigator.vibrate(100); createAndDestroyWallets(walletList,'subt'); });
	
	$('#20subt').click(function(){navigator.vibrate(100);  clickPicture(quickTwenty,'subt'); });
	$('#20add').click(function(){navigator.vibrate(100); clickPicture(quickTwenty,'add'); });
	$('#10subt').click(function(){navigator.vibrate(100); clickPicture(quickTen,'subt'); });
	$('#10add').click(function(){navigator.vibrate(100); clickPicture(quickTen,'add'); });
	$('#5subt').click(function(){navigator.vibrate(100); clickPicture(quickFive,'subt'); });
	$('#5add').click(function(){navigator.vibrate(100); clickPicture(quickFive,'add'); });
	$('#1subt').click(function(){navigator.vibrate(100); clickPicture(quickOne,'subt'); });
	$('#1add').click(function(){ navigator.vibrate(100); clickPicture(quickOne,'add');});
	
	$('#25csubt').click(function(){navigator.vibrate(100); clickPicture(quickQuarter,'subt'); });
	$('#25cadd').click(function(){navigator.vibrate(100); clickPicture(quickQuarter,'add'); });
	$('#10csubt').click(function(){navigator.vibrate(100); clickPicture(quickDime,'subt'); });
	$('#10cadd').click(function(){navigator.vibrate(100); clickPicture(quickDime,'add'); });
	$('#5csubt').click(function(){navigator.vibrate(100); clickPicture(quickNickel,'subt'); });
	$('#5cadd').click(function(){navigator.vibrate(100); clickPicture(quickNickel,'add'); });
	$('#1csubt').click(function(){navigator.vibrate(100); clickPicture(quickPenny,'subt'); });
	$('#1cadd').click(function(){navigator.vibrate(100); clickPicture(quickPenny,'add'); });
	
	$('#Start').click(function(){navigator.vibrate(100);});
	$('#equalResults').click(function(){navigator.vibrate(100);});
	$('#individual').click(function(){navigator.vibrate(100);});
	$('#Continue3').click(function(){navigator.vibrate(100);});
	$('#GoBack1').click(function(){navigator.vibrate(100);});
	$('#GoBack2').click(function(){navigator.vibrate(100);});
	$('#GoBack3').click(function(){navigator.vibrate(100);});
	$('#GoBack4').click(function(){navigator.vibrate(100);});
	$('#GoBack5').click(function(){navigator.vibrate(100);});
	
	//Payment Type and Tax - OnClick Events
	$('#totalNoTax, #taxOnly').change(function(){calculateTaxPercentage();});
	
window.onload=function() {
				$('#navbarEqual').hide();
				$('#navbarIndie').show();
				document.getElementById("TotalDisplay").style.display = "none";
				document.getElementById("equalResultsGoBack").style.display = "none";
		
			document.getElementById("radio-choice-1").onchange = function ChangeDropdowns() { // Individual Debts
				if(this.checked == true) {
				document.getElementById("TotalDisplay").style.display = "none";
				document.getElementById("taxCalculationBox").style.display = "block";
				
				$('#navbarIndie').show();
				document.getElementById("individualGoBack").style.display = "block";
				$('#navbarEqual').hide();
				document.getElementById("equalResultsGoBack").style.display = "none";
				splitEquallyBool = false;
				}
			navigator.vibrate(100);
			};
			document.getElementById("radio-choice-2").onchange = function ChangeDropdowns() { //Equal Split
				if(this.checked == true) {
				document.getElementById("TotalDisplay").style.display = "block";
				document.getElementById("taxCalculationBox").style.display = "none";
				
				$('#navbarIndie').hide();
				document.getElementById("individualGoBack").style.display = "none";
				
				$('#navbarEqual').show();
				document.getElementById("equalResultsGoBack").style.display = "block";
				splitEquallyBool = true;
				}
			navigator.vibrate(100);
			};

};
	
	// Individual Debts - OnClick Events
	$('#debtReporting').change(function(){navigator.vibrate(100); adjustSlidersForDebt(); });
	$('#iterateBackwards').click(function(){navigator.vibrate(100); iterateThroughWalletList('backward');});
	$('#iterateForwards').click(function(){navigator.vibrate(100); iterateThroughWalletList('forward');});
	
	//Results - OnClick Events
	$('#displayButton').click(function(){navigator.vibrate(100); toggleTotals();});
	$('#makeChangeCheckbox').click(function(){navigator.vibrate(100); toggleChange();});
	$('.restoreOrig').click(function(){navigator.vibrate(100); restoreOriginalValues();});
	$('.recalculate').click(function(){navigator.vibrate(100); restartMethod();});
	