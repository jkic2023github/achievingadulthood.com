---
layout: post
title: "Amortization Calculator"
author: jake
categories: [ finance ]
image: assets/images/10.jpg
---

Managing your mortgage effectively is crucial for financial stability. Use this amortization calculator to see how different payment scenarios affect your loan.

## Amortization Calculator

<div class="container">
    <h1>Amortization Calculator</h1>
    <label for="loanAmount">Loan Amount:</label>
    <input type="number" id="loanAmount" placeholder="Enter your loan amount">
    
    <label for="interestRate">Interest Rate (%):</label>
    <input type="number" id="interestRate" placeholder="Enter your interest rate" step="0.01">
    
    <label for="loanTerm">Loan Term (years):</label>
    <input type="number" id="loanTerm" placeholder="Enter your loan term in years">
    
    <label for="biWeekly">Bi-weekly Payments:</label>
    <input type="checkbox" id="biWeekly">
    
    <label for="startBiWeekly">Start Month for Bi-weekly Payments:</label>
    <input type="number" id="startBiWeekly" placeholder="Enter the start month for bi-weekly payments" step="1" min="1">
    
    <label for="extraLumpSum">Extra Lump Sum Payment:</label>
    <input type="number" id="extraLumpSum" placeholder="Enter extra lump sum payment" step="0.01">
    
    <label for="lumpSumMonth">Month to Pay Lump Sum:</label>
    <input type="number" id="lumpSumMonth" placeholder="Enter the month to pay lump sum" step="1" min="1">
    
    <label for="extraRecurring">Extra Recurring Payment:</label>
    <input type="number" id="extraRecurring" placeholder="Enter extra recurring payment" step="0.01">
    
    <label for="recurringStartMonth">Start Month for Recurring Payment:</label>
    <input type="number" id="recurringStartMonth" placeholder="Enter the start month for recurring payment" step="1" min="1">
    
    <button onclick="generateAmortization()">Generate Amortization Schedule</button>
    
    <div id="regularPayment" class="highlight"></div>
    
    <h3>Amortization Schedule:</h3>
    <table id="amortizationTable">
        <thead>
            <tr>
                <th>Month</th>
                <th>Principal Paid</th>
                <th>Interest Paid</th>
                <th>Extra Principal Payment</th>
                <th>Total Interest Paid</th>
                <th>Remaining Balance</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    
    <h3>Savings Graph:</h3>
    <canvas id="savingsChart" width="400" height="200"></canvas>
    
    <h3 id="savingsSummary" style="text-align: center; color: #333;"></h3>
</div>

<script>
    function generateAmortization() {
        let loanAmount = parseFloat(document.getElementById('loanAmount').value);
        let interestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
        let loanTerm = parseInt(document.getElementById('loanTerm').value) * 12;
        let biWeekly = document.getElementById('biWeekly').checked;
        let startBiWeekly = parseInt(document.getElementById('startBiWeekly').value) || 0;
        let extraLumpSum = parseFloat(document.getElementById('extraLumpSum').value) || 0;
        let lumpSumMonth = parseInt(document.getElementById('lumpSumMonth').value) || 0;
        let extraRecurring = parseFloat(document.getElementById('extraRecurring').value) || 0;
        let recurringStartMonth = parseInt(document.getElementById('recurringStartMonth').value) || 0;

        let monthlyPayment = loanAmount * interestRate / (1 - Math.pow(1 + interestRate, -loanTerm));
        let biWeeklyPayment = monthlyPayment / 2;
        document.getElementById('regularPayment').innerText = `Regular Monthly Payment (Principal & Interest): $${monthlyPayment.toFixed(2)}`;

        let amortizationData = [];
        let totalInterestPaid = 0;
        let principalPaid, interestPaid, extraPrincipal, remainingBalance = loanAmount;
        let biWeeklyCounter = 0;
        let totalPayments = biWeekly ? loanTerm * 2 : loanTerm;

        for (let month = 1; month <= totalPayments; month++) {
            interestPaid = remainingBalance * interestRate;
            if (biWeekly && month >= startBiWeekly && biWeeklyCounter % 6 === 0 && biWeeklyCounter !== 0) {
                // Extra principal payment every 6 months
                extraPrincipal = biWeeklyPayment * 2;
                biWeeklyCounter = 0;  // Reset the counter
            } else {
                extraPrincipal = 0;
            }
            principalPaid = (biWeekly && month >= startBiWeekly) ? biWeeklyPayment - interestPaid / 2 : monthlyPayment - interestPaid;
            extraPrincipal += (month === lumpSumMonth ? extraLumpSum : 0) + (month >= recurringStartMonth ? extraRecurring : 0);

            totalInterestPaid += interestPaid;
            remainingBalance -= (principalPaid + extraPrincipal);

            amortizationData.push({ month, principalPaid, interestPaid, extraPrincipal, totalInterestPaid, remainingBalance });

            if (biWeekly && month >= startBiWeekly) {
                biWeeklyCounter++;
            }

            if (remainingBalance <= 0) break;
        }

        populateTable(amortizationData);
        generateSavingsChart(amortizationData);
        calculateSavingsSummary(amortizationData, loanTerm, totalInterestPaid);
    }

    function populateTable(data) {
        let tableBody = document.getElementById('amortizationTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';

        data.forEach(entry => {
            let row = tableBody.insertRow();
            row.insertCell(0).innerText = entry.month;
            row.insertCell(1).innerText = entry.principalPaid.toFixed(2);
            row.insertCell(2).innerText = entry.interestPaid.toFixed(2);
            row.insertCell(3).innerText = entry.extraPrincipal.toFixed(2);
            row.insertCell(4).innerText = entry.totalInterestPaid.toFixed(2);
            row.insertCell(5).innerText = entry.remainingBalance.toFixed(2);
        });
    }

    function generateSavingsChart(data) {
        let labels = data.map(entry => entry.month);
        let principalData = data.map(entry => entry.principalPaid);
        let interestData = data.map(entry => entry.interestPaid);
        let extraPrincipalData = data.map(entry => entry.extraPrincipal);

        let ctx = document.getElementById('savingsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'Principal Paid', data: principalData, borderColor: 'green', fill: false },
                    { label: 'Interest Paid', data: interestData, borderColor: 'red', fill: false },
                    { label: 'Extra Principal', data: extraPrincipalData, borderColor: 'blue', fill: false }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    function calculateSavingsSummary(data, originalLoanTerm, totalInterestPaid) {
        let shortenedTerm = data.length;
        let interestSaved = totalInterestPaid - data[data.length - 1].totalInterestPaid;
        document.getElementById('savingsSummary').innerText = `By making extra payments, you have shortened your loan term by ${(originalLoanTerm - shortenedTerm) / 12} years and saved $${interestSaved.toFixed(2)} in interest!`;
    }
</script>
