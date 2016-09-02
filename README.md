# Fambit [![Build Status](https://travis-ci.org/fambit-app/fambit.svg?branch=master)](https://travis-ci.org/fambit-app/fambit)

Fambit is a WebExtension for Firefox, Opera and Chrome to "Make the Web Great Again" by replacing advertisements.
It's an opt-in system where users can automatically "microdonate" bitcoin to each website that they visit.

## Building and running

1. `npm install`
2. `npm run dev`
3. In Firefox Developer Edition, `about:debugging` > Enable add-on debugging
4. In Firefox Developer Edition, `about:debugging` > Load Temporary Add-on, choose `gen/manifest.json`

## FAQ

### How does it work?

Joe is a consumer of the Internet. He likes cat videos, though he recently has been following some blogs that publish
interesting information about vehicle maintenance. He has installed Fambit onto his browser, and has already sent
a small amount of bitcoin to his instance of the plugin. Now, each time he reads one of those neat blog posts about
cars, Fambit will express his gratuity by sending a fraction of its remaining bitcoin funds to the blog author.

### So, are you making a paywall? Don't you know paywalls are worse than old oatmeal?

Fambit is _not_ a requirement to access content. Only users that _want_ to participate will be spending any bitcoin.
The "Fambit Theory"™ is that many consumers _do_ want to pay for content, but not enough that it's worth manually
spending any amount of actual money. The beauty of bitcoin is that very small amounts of value can be transferred, so
users are able to express their gratitude in a way that's negligible per-user, yet can be a bonus for the content
producer.

### but_why.gif?

Though advertising is already providing a similar value to authors, and it doesn't require user payment, advertising
has become a bit of a "greasy" industry. User-tracking and increasingly-deceptive tactics make dealing with ads very 
undesirable for everyone who uses the internet. Ideally, Fambit participants can provide enough income that casual
website maintainers won't be forced to turn to advertising to cover costs.

### I'm sold. How do I participate?

This is a deliverable for our final-year project at Thompson Rivers University, so there'll definitely be an
installable browser plugin by the end of 2016. However, no deliverables exist yet, sorry (#canada).

### How do I contribute?

Neat, you're a champion for even considering it. This is a GitHub project, so if you see any issues, just report them
on the [issues page](https://github.com/fambit-app/fambit/issues). If you're super xtreme, you can also create a
[pull request](https://github.com/fambit-app/fambit/pulls). Travis CI will automatically check formatting and run all
tests in `test/`.