*sigfox-aws** is a software framework for building a
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

# Installing the `sigfox-aws` server

Instructions for installing the `sigfox-aws` Lambda Functions and AWS IoT Rules may
be found here:

https://github.com/UnaBiz/sigfox-aws/blob/master/sigfoxCallback/index.js

https://github.com/UnaBiz/sigfox-aws/blob/master/routeMessage/index.js

https://github.com/UnaBiz/sigfox-aws/blob/master/decodeStructuredMessage/index.js

https://github.com/UnaBiz/sigfox-aws/blob/master/processIoTLogs/index.js

# Monitoring the `sigfox-aws` server

**AWS CloudWatch** may be used to view the log messages from the Lambda Functions.

**AWS X-Ray** is supported for tracing Sigfox messages as they are processed
via AWS IoT Rules, MQTT Queues and Lambda Functions.

The **X-Ray Service Map** visualises the flow of Sigfox messages from/to AWS IoT Rules, MQTT Queues and Lambda Functions:

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/xray-map.jpg" width="1024"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/xray-map.png)

The **X-Ray Trace** shows the detailed processing of Sigfox messages by AWS IoT Rules, MQTT Queues and Lambda Functions
(to filter by devce ID, select **User** from the filter box):

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/xray-trace.jpg" width="1024"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/xray-trace.png)

Clicking a row in the **X-Ray Trace** shows the Sigfox message in the **Annotations Tab.**
More details are available in the **Metadata Tab**.

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/xray-msg.jpg" width="1024"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/xray-msg.png)

# Creating a Sigfox message processing module

Look at `aggregateSensorData` for a sample Sigfox message processing module that
was created with the `sigfox-aws` framework. This AWS Lambda Function adds up the last 10 values of the `tmp` (temperature) sensor
and injects a new sensor value named `tmpsum`

https://github.com/UnaBiz/sigfox-aws/blob/master/aggregateSensorData/index.js

# `sigfox-aws-ubidots` adapter for Ubidots

The [`sigfox-aws-ubidots`](https://www.npmjs.com/package/sigfox-aws-ubidots) adapter is a Google Cloud Function
(developed with the `sigfox-aws` framework) that integrates with **Ubidots** to provide a comprehensive IoT
platform for Sigfox.

With Ubidots and `sigfox-aws-ubidots`, you may easily visualise sensor data from your Sigfox devices and monitor
for alerts. To perform custom processing of your Sigfox device messages before passing to Ubidots,
you may write a Google Cloud Function with the `sigfox-aws` framework.

`sigfox-aws-ubidots` also lets you to visualise in real-time the **Sigfox Geolocation** data from your Sigfox devices,
or other kinds of GPS tracking data.  For details, check out:

[`https://www.npmjs.com/package/sigfox-aws-ubidots`](https://www.npmjs.com/package/sigfox-aws-ubidots)

[`https://unabiz.github.io/unashield/ubidots`](https://unabiz.github.io/unashield/ubidots)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-dashboard.jpg" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-dashboard.png)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device-list.jpg" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device-list.png)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device.jpg" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device.png)

# `sigfox-aws-data` adapter for databases

The [`sigfox-aws-data`](https://www.npmjs.com/package/sigfox-aws-data) adapter is a Google Cloud Function
(developed with the `sigfox-aws` framework) that writes decoded Sigfox messages into many types of SQL databases
including **MySQL, Postgres, MSSQL, MariaDB and Oracle**. For details, check out:

[`https://www.npmjs.com/package/sigfox-aws-data`](https://www.npmjs.com/package/sigfox-aws-data)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/data-mysql.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/data-mysql.png)
