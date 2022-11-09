App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("Utsav19IT029TokenSale.json", function(Utsav19IT029TokenSale) {
        App.contracts.Utsav19IT029TokenSale = TruffleContract(Utsav19IT029TokenSale);
        App.contracts.Utsav19IT029TokenSale.setProvider(App.web3Provider);
        App.contracts.Utsav19IT029TokenSale.deployed().then(function(Utsav19IT029TokenSale) {
          console.log("Utsav19IT029 Token Sale Address:", Utsav19IT029TokenSale.address);
        });
      }).done(function() {
        $.getJSON("Utsav19IT029.json", function(Utsav19IT029) {
          App.contracts.Utsav19IT029 = TruffleContract(Utsav19IT029);
          App.contracts.Utsav19IT029.setProvider(App.web3Provider);
          App.contracts.Utsav19IT029.deployed().then(function(Utsav19IT029) {
            console.log("Utsav19IT029 Token Address:", Utsav19IT029.address);
         
            App.listenForEvents();
            return App.render();
         
          });
    
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.Utsav19IT029TokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
    
  
  // Load account data
      if(web3.currentProvider.enable){
        //For metamask
        web3.currentProvider.enable().then(function(acc){
            App.account = acc[0];
          $('#accountAddress').html("Your Account: " +  App.account);
        });
    } else{
        App.account = web3.eth.accounts[0];
        $('#accountAddress').html("Your Account: " +  App.account);
    }
  
  
      // Load token sale contract
      App.contracts.Utsav19IT029TokenSale.deployed().then(function(instance) {
        Utsav19IT029TokenSaleInstance = instance;
        return Utsav19IT029TokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return Utsav19IT029TokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        console.log("Token Sold ");
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.Utsav19IT029.deployed().then(function(instance) {
          const Utsav19IT029Instance = instance;
          return Utsav19IT029Instance.balanceOf(App.account);
        }).then(function(balance) {
          $('.U19IT029-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      const numberOfTokens = $('#numberOfTokens').val();
      App.contracts.Utsav19IT029TokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });