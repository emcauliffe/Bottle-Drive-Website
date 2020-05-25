# Bottle-Drive-Website

This website aims to make it easy for people to setup, or signup for, empty bottle pickups with the goal of donating all raised funds to charity.

## How it all started

During the COVID-19 pandemic people have been spending a lot more time at home. With this, alcohol consumption has increased greatly. In the USA, [some studies suggest](https://apnews.com/c407ecb931c6c528b4cceb0ecc216f0c) a 55% year-over-year increase in alcohol sales from this time last year. [Surveys show](https://www.ccsa.ca/sites/default/files/2020-04/CCSA-NANOS-Alcohol-Consumption-During-COVID-19-Report-2020-en.pdf) that Canada is no different. While this "coping mechanism" is [ill-advised by the WHO](http://www.euro.who.int/__data/assets/pdf_file/0010/437608/Alcohol-and-COVID-19-what-you-need-to-know.pdf), it seems that citizens don't seem to care all that much.

It was my sister's idea to turn this into something positive. She figured that all the empty bottles sitting at people's homes could be returned to the Beer store, and the proceeds could be donated to charity. Her charity of choice was the [St. Joe's Hospital COVID-19 fund](https://secure3.convio.net/stjoca/site/SPageNavigator/westendheroes_home.html). She created a [calendly](https://calendly.com/) page and posted on a few local Facebook pages. Pickup would be completely contactless – registrants would simply leave their empties on their front porch or curb. News of the initiative spread fast, and hundreds of people signed up.

On the first pickup day we realized there was a problem. We had *a lot* more support than expected. So much so it was overwhelming. Bottle pickup, which was estimated to take 3 hours, took 8. In one day, we collected 4000+ bottles from 50+ houses. While it was great to see the community rally behind such a great cause, this amount was overwhelming. It took 6 full days of bottle sorting and returning to get through this amount. The day after we finished was another scheduled pickup day. We needed a way to limit our intake without limiting our impact.

So I started working on this website. The goal was to create a website that could limit the amount collected by number of bottles (instead of number of pickups), and also allow others to join in on our solution. By allowing anyone to create their own bottle drive, we reduce the number of people leaving their homes to return empties, and empower others to help.

## How the website works

The website has three main parts:

 1. ReactJS front-end
 2. Flask back-end
 3. Mongo-DB database

### React Front-End

The front-end is client rendered and communicates directly with the Flask backend using the fetch API. Some pages (home page, FAQ page) are hand-written in HTML with a little bit of JS. I am using yarn for package management.

My experience with React Native at my job last summer and DeltaHacks IV was invaluable for this part. However, I did learn a lot of new things about React and JS from this project. I think my biggest growth was in design. This is the first website I have made where the visual aspects were considered. All my prior layout experience was with React Native, which is a little bit different from ReactJS. I also feel like I garnered a better understanding of React and JS this time compared to last. If I were to do this again, I might use something like [Preact](https://github.com/preactjs/preact). I feel as if I have left much of the capabilities of React on the table, and that it may have been overkill.

### Flask Back-End

The Flask back-end is mostly RESTful, with a caveat. The caveat is that sessions are handled server-side using the "session" library built into Flask. The back-end communicates with the database via mongoengine. I am using Poetry for package management.

This part of the build process was almost entirely foreign to me. I had some experience with basic Flask development after my DeltaHacks IV project, but otherwise I was in the dark. I was able to build the foundations for my website thanks to the great tutorials available online, specifically [this one](https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project), and [this one](https://dev.to/paurakhsharma/flask-rest-api-part-1-using-mongodb-with-flask-3g7d). If I were to do this part again, I would likely choose a different framework than Flask. Perhaps [FastAPI](https://fastapi.tiangolo.com/).

### MongoDB Database

Before this project, I had no experience with MongoDB. Everything I know, I learned from building this website. I chose MongoDB simply off the recommendation of a friend to give NoSQL a try.

I will say, using MongoDB with mongoengine was a joy. It was very easy to use and the built-in geo-query capabilities of MongoDB made the search feature on the website's main page a snap.

### Other

Here's a quick rundown of the stack I'm using and some of the other tools involved:

 - gandi.net domain hosting, DNS, and email
 - DigitalOcean hosting (running Ubuntu 18.04)
 - Nginx HTTP server with reverse-proxy to allow front-end to back-end communication
 - Let's Encrypt with certbot for HTTPS
 - ReactJS
   - React Router
   - react-map-gl
   - hCaptcha
   - nominatim
   - yarn package management
 - Flask
   - mongoengine
   - Flask-RESTful
   - Poetry package manager
   - CSV streaming downloads
 - SimpleAnalytics for cookie-free, privacy-aware analytics
 - FreeNAS at my home for an offsite daily backup of the database
 - git (...duh)
