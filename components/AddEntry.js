import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platfom, StyleSheet, Platform } from 'react-native';
import { getMetricMetaInfo, timeToString, getDailyReminderValue } from '../utils/helpers';
import UdaciSteppers from './UdaciSteppers';
import UdaciSlider from './UdaciSlider';
import DateHeader from './DateHeader';
import { Ionicons } from '@expo/vector-icons';
import TextButton from './TextButton';
import { submitEntry, removeEntry } from '../utils/api.js';
import { connect } from 'react-redux';
import { addEntry } from '../actions';
import { white, purple } from '../utils/colors';

function SubmitBtn ( { onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={Platform.OS === 'ios' ? styles.iosSubmit : styles.androidSubmit}>
            <Text style={styles.submitBtnText}>SUBMIT</Text>
        </TouchableOpacity>
    );
}

class AddEntry extends Component {

    state = {
        run: 50,
        bike: 10,
        swim: 0,
        sleep: 0,
        eat: 0
    }

    increment = (metric) => {
        const { max, step } = getMetricMetaInfo(metric);

        this.setState ( (state) => {
            const count = state[metric] + step;
            return {
                ...state, [metric]: count > max ?max:count
            }
        })
    }

    decrement = (metric) => {
       
        this.setState ( (state) => {
            const count = state[metric] - getMetricMetaInfo(metric).step;
            return {
                ...state, [metric]: count < 0 ? 0:count
            }
        })

      

    }

    slide = (metric, value) => {
        console.log("in");
        this.setState( () => ({
            [metric]: value
        }))
    }

    submit = () => {
        const key = timeToString();
        const entry = this.state;

        this.props.dispatch(addEntry({
            [key]:entry
        }))

        this.setState( () => ({
            run: 0,
            bike: 0,
            swim: 0,
            sleep: 0,
            eat: 0
        }));



        //Update redux
        //Naviget to home
        submitEntry( {key, entry});
        //Clear local notificiaiton
    }
 

    reset = () => {
        const key = timeToString();

        this.props.dispatch(addEntry( {
            [key]: getDailyReminderValue()
        }));

        //update redux
        //update route to home
        //update db
        removeEntry(key);
    }

    render() {
        const metaInfo = getMetricMetaInfo();

        if(this.props.alreadyLogged) {
            return (
                <View style={styles.center}>
                    <Ionicons name={Platform.OS === 'ios'? 'ios-happy-outline': 'md-happy'} size={100}  />
                    <Text>You're already logged your information for today</Text>
                    <TextButton style={{padding: 10}} onPress={this.reset} >
                        Reseti
                    </TextButton>
                </View>
        
            )
        }

        return (
            <View style={styles.container}>
               <DateHeader date={(new Date()).toLocaleDateString()} />
               {Object.keys(metaInfo).map( (key) => {
                    const  { getIcon, type, ...rest } = metaInfo[key];
                    const value = this.state[key];

                    return (
                        <View key={key} style={styles.row} >
                            { getIcon() }
                            {  type === 'slider'
                                ? <UdaciSlider 
                                    value={value} 
                                    onChange={ (value) => this.slide(key, value)} {...rest} />
                                : <UdaciSteppers
                                    value={value}
                                    onIncrement={ () => this.increment(key)}
                                    onDecrement={ () => this.decrement(key)} {...rest} />
                                 
                            } 
                           <Text text="blah" />
                        </View>
                    )
               })}
               <SubmitBtn onPress={this.submit} />
            </View>
        )
    }
}

const styles = StyleSheet.create( {
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 30,
        marginLeft: 30
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: white
    },
    row: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',

    },
    iosSubmit: {
        backgroundColor: purple,
        padding: 10,
        borderRadius: 7,
        height: 45,
        marginLeft: 40,
        marginRight: 40

    },
    androidSubmit: {
        backgroundColor: purple,
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 2,
        height: 45,
        marginLeft: 40,
        marginRight: 40,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center'  
    },
    submitBtnText: {
        color: white,
        fontSize: 22,
        textAlign: 'center'

    }
});

function mapStateToProps(state) {
    const key = timeToString();

    return {
        alreadyLogged : state[key] && typeof state[key].today === 'undefined'
    }
}

export default connect(mapStateToProps)(AddEntry)