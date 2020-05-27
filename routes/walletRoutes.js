const wallet = require('../wallet.json')
const fs = require('fs')
const path = require("path")
module.exports = (app) => {
  app.delete('/api/expense/:id', async (req, res) => {
    await updateremove('remove', req)
    fs.writeFile(path.resolve('wallet.json'), JSON.stringify(wallet), 'utf8', (err) => {
      if (!err) {
        res.send({
          "code": 200,
          "message": "removed successfully"
        });
      }
    });
  });

  app.get('/api/expense', async (req, res) => {
    res.send(wallet);
  });
  app.post('/api/expense', async (req, res) => {
    const {
      description,
      amount,
      date,
      type
    } = req.body;
    if (!description || description == '' || !amount || amount == '' || !date || date == '' || type == '' || !type) {
      res.send('Input Parameters not found')
      return
    }
    if (/^\d+$/.test(amount) == false) {
      res.send('Amount should be a number')
      return
    }
    const id = wallet.entries + 1
    if (wallet.history[date]) {
      if (wallet.history[date][type]) {
        wallet.history[date][type].push({
          id,
          description,
          amount
        })
      } else {
        wallet.history[date][type] = [{
          id,
          description,
          amount
        }]
      }
    } else {
      wallet.history[date] = {}
      wallet.history[date][type] = [{
        id,
        description,
        amount
      }]
    }
    wallet[type] += parseInt(amount)
    wallet["entries"] = wallet["entries"] + 1
    fs.writeFile(path.resolve('wallet.json'), JSON.stringify(wallet), 'utf8', (err) => {
      if (!err) {
        res.send({
          "code": 200,
          "message": "expense added"
        });
      }
    });

  });
  app.put('/api/expense/:id', async (req, res) => {
    req.body.newdate = req.body.date
    req.body.newtype = req.body.type
    await updateremove('update', req)
    fs.writeFile(path.resolve('wallet.json'), JSON.stringify(wallet), 'utf8', (err) => {
      if (!err) {
        res.send({
          "code": 200,
          "message": "expense updated"
        });
      }
    });
  });

  function updateremove(status, req) {
    const {
      description,
      amount,
      newdate,
      newtype
    } = req.body;
    const id = req.params.id
    for (const date in wallet.history) {
      if (wallet.history[date].income)
      var oldtype = 'income'; 
        var currentobject = wallet.history[date].income.find((data) => data.id == req.params.id)
      if (!currentobject && wallet.history[date].expense){
        currentobject = wallet.history[date].expense.find((data) => data.id == req.params.id)
        oldtype = 'expense'
      } 
      if (currentobject) {
          currentobject.description = description
          if(currentobject.amount != amount || oldtype != newtype) {
            wallet[oldtype] = wallet[oldtype] - currentobject.amount
          }
          currentobject.amount = amount
          currentobject = wallet.history[date].income.find((data) => data.id == req.params.id)
          if (currentobject) wallet.history[date].income = wallet.history[date].income.filter((data) => data.id != req.params.id)
          else wallet.history[date].expense = wallet.history[date].expense.filter((data) => data.id != req.params.id)
          wallet.entries = wallet.entries -1
          if (status == 'update') {
            if (!wallet.history[newdate]) wallet.history[newdate] = {}
            if (!wallet.history[newdate][newtype]) wallet.history[newdate][newtype] = []
            wallet.history[newdate][newtype].push({
              id,
              description,
              amount
            })
            wallet[newtype] = wallet[newtype] + parseInt(amount)
            wallet.entries = wallet.entries +1
          }
        break;
      };
    }
    return true
  }
};

