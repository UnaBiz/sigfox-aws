(UNDER DEVELOPMENT)

**sigfox-aws** is a software framework for building a
Sigfox server with Amazon Web Service Lambda Functions and AWS IoT MQTT message queues:

- **Modular**: Process Sigfox messages in modular steps using 
  simple Node.js (JavaScript) functions and AWS IoT Rules.
  
- **Extensible**: Allows new Sigfox message processing modules and rules to be added on the
  fly without disrupting or restarting all modules.  
  
- **Robust**: The processing modules are implemented
  as separate AWS Lambda Functions, so one module
  crashing will not affect others. AWS IoT MQTT message
  queues are used to pass the Sigfox messages reliably between processing modules.

Read about the `sigfox-gcloud` architecture here, which is very similar to `sigfox-aws`:
[How To Build Your Sigfox Server](https://medium.com/@ly.lee/how-to-build-your-sigfox-server-version-1-0-6763732692fd)

We are now aligning the `sigfox-gcloud` and `sigfox-aws` interfaces so that any `sigfox-gcloud` module
will work on `sigfox-aws` and vice versa.

Other `sigfox-aws` modules available:

1. [`sigfox-aws-ubidots`:](https://www.npmjs.com/package/sigfox-aws-ubidots)
    Adapter for integrating Sigfox devices with the easy and friendly **Ubidots IoT platform**

2. [`sigfox-aws-data`:](https://www.npmjs.com/package/sigfox-aws-data)
    Adapter for writing Sigfox messages into SQL databases like **MySQL, Postgres, MSSQL, MariaDB and Oracle**

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/sigfox-aws-arch.svg" width="1024"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/sigfox-aws-arch.svg)
