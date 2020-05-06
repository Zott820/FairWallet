# FairWallet
**tldr:** Fairwallet is a bill reconciliation tool for the post-dining experience. Originally an app, code is a playground for ideas.

**Purpose:**

Imagine yourself sitting at a restaurant sitting with three of your best buddies. You've just eaten the most delicious meal, when the bill arrives. Your friends and you take out your wallets, stare at the bills and consider your options. Should your friend throw down the twenty and you all pay him? Or should each of you contribute some of your smaller bills and hope that you all have exact change? 

Enter FairWallet! FairWallet will use the available physical cash in your possession to determine the optimal way to pay. Just tell it what bills you have on hand, and FairWallet will calculate who gives what to whom!


**Tips for using FairWallet:**

On the individual debts screen, you may combine multiple items together using operators as the input. For example, if Suzy ordered a $1.25 drink and a $7.99 burger, type in " 1.25+7.99 " and FairWallet will automatically add the values. Multiplication, subtraction and division operations are also possible.
On the results screen, by setting the Upper Tip to the same percentage as the Lower Tip, the results at that exact tip will be shown after recalculation. Set both values to 0 to view the results without a tip applied.

You may wish to hit re-calculate a couple of times to see if a better result appears. As some bills cannot be evenly split, the penny remainders are randomly distributed.
If an individual is paying with card, it may help to set their amount spent to 0, but include any currency they have on-hand.

**Technical Details:**
* jQuery Mobile 1.4.5
* jQuery 2.2.4
* Javascript

This application was previously released on the Google App store circa 2013. That version used JQuery 1, and an older version of 
jQuery Mobile. Although jQuery Mobile is abandoned as a technology, this project will likely not transition to another GUI. The project was a first practice with Javascript, so it's object orientation and organization is in need of refractoring.

**Algorithm:**

Wallets are the terminology for people/individuals/holders of bills/debt.
The resturant/bill/bank is it's own wallet.
Negative debt means the wallet is owed money, positive debt value means the wallet owes money. The opposite is true of the bank wallet.

The main application portion has 3 algorithmns that can be chosen in the javascript file under 'mainAlgorithm". By default a recursion/greedy is used in the main branch.
1) greedySolve: First the Bank is paid from the person who has the least bill flexibility. That is, the wallet with the fewest quantity of denominations below each current tier of denomination, though only if they have the denomination.
IE, if everybody has 20s to spare, take it from the guy who doesn't have any 10s next because they have fewer ways to pay off any high amount inequalities generated later. This continues until the Bank is paid off. Next, wallets who underpaid (-debts) will recieve money by any wallet with less underpaid-ness below them. The rule for giving is to loop through the wallets and only give to the next available wallet whose debt is is atleast the denomination size. Largest denominations are handed out first. <Fast but sometimes misses oppertunities>

2) Random [Broken/unused] 'IterativeSolveSetup' : Hand out bills randomly and hope for the lowest sum of absolute debts.

3) recursiveSolve: Generate a recursive node tree of every potential wallet handout. Hand out denominations largest to smallest to converge the absolute debts faster. To eliminate duplicates, store unique wallet combinations in an array that checked before dropping into another recursive node. Compare the current node's absolute debt to the parent and kill it if the child has a greater/worse absolute debt. Each denomination handed out is a 'level' in the node tree. Save the best absolute debt per level. Have a node compare it's absolute debt against the level's best and prevent children if worse debt.  In cases of multiple solutions for best debt, choose the one with the lowest movement of bills from the initial state. <Slow around 12 denominations.>

**Tipping:**
Re-runs the main algoithmn between the Low and High Tip Range and return the lowest absolute debt version.
Payeers are usually ok with overpaying a bit to cover tip, but resturants are definitely not ok with underpaying, so the tipping algorithmn should be rewritten with that in mind.

**Making Change:**
Choose the smallest denomination that can make change from the wallet with the largest debt. (Still needs to Pay). Split it, and re-run the main algorithmn to see if it improved the debt to 0. If not, keep repeating until the debt is paid off. Worse case, every large bill is split into pennies. :O

