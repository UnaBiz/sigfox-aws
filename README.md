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

We have aligned the Google Cloud (`sigfox-gcloud`) and AWS (`sigfox-aws`) frameworks so that any `sigfox-gcloud` module
will work on `sigfox-aws` and vice versa.   The common code for both frameworks has
been refactored into [`sigfox-iot-cloud`](https://www.npmjs.com/package/sigfox-iot-cloud)

Other `sigfox-aws` modules available:

1. [`sigfox-iot-ubidots`:](https://www.npmjs.com/package/sigfox-iot-ubidots)
    Adapter for integrating Sigfox devices with the easy and friendly **Ubidots IoT platform**

2. [`sigfox-iot-data`:](https://www.npmjs.com/package/sigfox-iot-data)
    Adapter for writing Sigfox messages into SQL databases like **MySQL, Postgres, MSSQL, MariaDB and Oracle**

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/sigfox-aws-arch.svg" width="1024"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/sigfox-aws-arch.svg)

# Integration with AWS IoT

`sigfox-aws` is seamlessly integrated with AWS IoT and AWS Lambda Functions. Sigfox devices
are represented as AWS IoT Things and can be used with AWS IoT Rules.

## AWS IoT Things

The `sigfox-aws` framework automatically creates an **AWS IoT Thing** for each Sigfox device ID
that it discovers through the received Sigfox messages.

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-things.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-things.png)

## AWS IoT Thing Shadow

The **Thing Shadow** contains the last received Sigfox message and any decoded values
from that message.

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-shadow.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-shadow.png)

## AWS IoT MQTT Queues

Messages received from Sigfox are added to the **AWS IoT MQTT queue** `sigfox/received` before processing.

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-received.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-received.png)

After decoding the message, it is delivered to the MQTT queue `sigfox/devices/<deviceID>`.
In the example below, the values `tmp`, `hmd` and `alt` were decoded from the
`data` field in the Sigfox message (by the Lambda Function `decodeStructuredMessage`).

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-device-msg.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-device-msg.png)

## AWS IoT Rules

AWS IoT Rules may listen to the MQTT queue `sigfox/devices/<deviceID>` to process decoded
Sigfox messages by device ID. To send a notification when the temperature sensor value (`tmp`)
exceeds 30, write a rule like this:

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-rule.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/aws-rule.png)

The action for the rule could trigger an AWS SNS Email/SMS notification, 
or a Lambda Function, etc.

# Installing the `sigfox-aws` server

Instructions for installing the `sigfox-aws` Lambda Functions and AWS IoT Rules may
be found here:

https://github.com/UnaBiz/sigfox-aws/blob/master/sigfoxCallback/index.js

https://github.com/UnaBiz/sigfox-aws/blob/master/routeMessage/index.js

https://github.com/UnaBiz/sigfox-aws/blob/master/decodeStructuredMessage/index.js

https://github.com/UnaBiz/sigfox-aws/blob/master/processIoTLogs/index.js

# Installing AWS Lambda dependencies automatically with AutoInstall

`sigfox-aws` uses a script called **AutoInstall** that allows you to use require(...) for NPM modules in AWS Lambda Functions,
**without preinstalling or bundling the dependencies in advance.**  This is meant to replicate the auto NPM install feature in Google Cloud Functions.

The AWS Lambda Function only needs to call AutoInstall with a list NPM modules to be installed.  
Upon starting the AWS Lambda Function, AutoInstall will install the NPM modules into `/tmp/node_modules`.
After installing the modules, AutoInstall launches a copy of the current Lambda Function script,
by copying it to /tmp/index.js.  The Lambda Function may then use the installed modules.

This is not as fast as preinstalling and bundling the dependencies, but it's easier to maintain and faster to prototype.
The first call to the AWS Lambda Function is slower (about 20 seconds for `sigfoxCallback`) 
because AutoInstall needs to load the dependencies. But subsequent calls will be faster (generally under 1 second) 
because the dependencies will be reused from /tmp/node_modules until AWS spawns another instance of the
Lambda Function.

The AutoInstall script is located at:

https://github.com/UnaBiz/sigfox-iot-cloud/blob/master/autoinstall.js

Standard AutoInstall template with sample usage:

https://github.com/UnaBiz/sigfox-iot-cloud/blob/master/test/test-autoinstall.js

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

# `sigfox-iot-ubidots` adapter for Ubidots

The [`sigfox-iot-ubidots`](https://www.npmjs.com/package/sigfox-iot-ubidots) adapter is an AWS Lambda Function
(developed with the `sigfox-aws` framework) that integrates with **Ubidots** to provide a comprehensive IoT
platform for Sigfox.

With Ubidots and `sigfox-iot-ubidots`, you may easily visualise sensor data from your Sigfox devices and monitor
for alerts. To perform custom processing of your Sigfox device messages before passing to Ubidots,
you may write a Google Cloud Function with the `sigfox-aws` framework.

`sigfox-iot-ubidots` also lets you to visualise in real-time the **Sigfox Geolocation** data from your Sigfox devices,
or other kinds of GPS tracking data.  For details, check out:

[`https://www.npmjs.com/package/sigfox-iot-ubidots`](https://www.npmjs.com/package/sigfox-iot-ubidots)

[`https://unabiz.github.io/unashield/ubidots`](https://unabiz.github.io/unashield/ubidots)

(Note: `sigfox-gcloud-ubidots` has been merged and renamed as `sigfox-iot-ubidots`)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-dashboard.jpg" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-dashboard.png)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device-list.jpg" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device-list.png)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device.jpg" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/ubidots-device.png)

# `sigfox-iot-data` adapter for databases

The [`sigfox-iot-data`](https://www.npmjs.com/package/sigfox-iot-data) adapter is an AWS Lambda Function
(developed with the `sigfox-aws` framework) that writes decoded Sigfox messages into many types of SQL databases
including **MySQL, Postgres, MSSQL, MariaDB and Oracle**. For details, check out:

[`https://www.npmjs.com/package/sigfox-iot-data`](https://www.npmjs.com/package/sigfox-iot-data)

(Note: `sigfox-gcloud-data` has been merged and renamed as `sigfox-iot-data`)

[<kbd><img src="https://storage.googleapis.com/unabiz-media/sigfox-gcloud/data-mysql.png" width="800"></kbd>](https://storage.googleapis.com/unabiz-media/sigfox-gcloud/data-mysql.png)

# Other implementations of AWS IoT integration with Sigfox

Sigfox provides an official connector for AWS IoT:

https://aws.amazon.com/fr/blogs/iot/connect-your-devices-to-aws-iot-using-the-sigfox-network/

The official connector for AWS IoT is suitable for simple integration scenarios with fixed Sigfox message formats.
The message will be decoded by Sigfox before executing any AWS IoT Rules.

`sigfox-aws` allows for complex integration scenarios with multiple message formats
per device type. AWS Lambda Functions may be built with the `sigfox-aws` framework
to perform custom processing of Sigfox messages. The `sigfox-aws` adapters for
Ubidots and SQL Databases were built with `sigfox-aws`.

`sigfox-aws` also supports AWS X-Ray for easier tracing and troubleshooting
of Sigfox message processing.
