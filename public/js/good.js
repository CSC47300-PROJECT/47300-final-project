const data = [
       {
          price_data: {
            currency:'usd',
            product_data: {
              name:'Pineapple',
              images: ['https://i.imgur.com/EHyR2nP.png'],
            },
            unit_amount: 3000,  //price $30;  needs x 100
          },
          quantity: 2,
        },
        {
          price_data: {
            currency:'usd',
            product_data: {
              name:'Live Lobster',
              images: ['https://i.imgur.com/EHyR2n9.png'],
            },
            unit_amount: 1000,
          },
          quantity: 3,
        },
    ]


    var add_item_btn=document.getElementsByClassName("bag-btn");
    var i_photo=document.getElementsByClassName("item_photo");
    var i_name=document.getElementsByClassName("item_name");
    var i_price=document.getElementsByClassName("item_price");


    for (var i = 0; i< add_item_btn.length; i++) {
        (function (i) {
        add_item_btn[i].onclick = function () {
        data.push(
            {
          price_data: {
            currency:'usd',
            product_data: {
              name:String(i_name[i]),
              images: [i_photo[i]],
            },
            unit_amount: (parseInt(i_price[i]))*100,
          },
          quantity: 1,
        }
        )
        console.log(data.length);
        }
        })(i)

    }