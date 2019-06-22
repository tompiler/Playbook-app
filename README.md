
# **_PLAYBOOK_**<!-- omit in toc -->

## Contents<!-- omit in toc -->
- [Overview](#Overview)
- [Requirements](#Requirements)
- [Structure](#Structure)


## Overview

**tl;dr**:
>*Playbook is an interactive data visualisation app which aims to make data about the business available to teammates in the UK, particularly store managers and sport leaders.*

**long version**:
>*Playbook is a web application designed with several aims:*
>1. _Make business data available to all teammates_
>2. _Improve wider understanding of the business and its performance_
>3. _Encourage teammates to use data to improve decision making_

>*The application presents the user with several different interactive visualisations and tables, giving the user access to a variety of datasets and the ability to explore millions of data points in just a few clicks.*

## Requirements

1. Access to decathlon.datamining and the Decathlon_UK folder in S3
2. A modern browser - unfortunately there is a bug with one component in FireFox. Please use Chrome for the app!

---

## Structure

The app will seem complicated, but is simplified with a basic understanding of React's (or other JavaScript frameworks like Angular or Vue) component hierarchy. A rough outline of the component hierarchy of this application can be found below:

![Playbook Structure Diagram](Playbook-structure.png)

