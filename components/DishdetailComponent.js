import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, FlatList, Button, Modal } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    debugger;
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, commentText) => dispatch(postComment(dishId, rating, author, commentText))
})

function RenderDish(props) {

    const dish = props.dish;
    
        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
                    <Card
                            featuredTitle={dish.name}
                        image={{uri: baseUrl + dish.image}}>
                        <Text style={{margin: 10}}>
                            {dish.description}
                        </Text>
                        <View  style= {styles.formRow}>
                            <Icon
                                raised
                                reverse
                                name={ props.favorite ? 'heart' : 'heart-o'}
                                type='font-awesome'
                                color='#f50'
                                onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                                style = {styles.formLabel}
                                />
                                <Icon
                                raised
                                reverse
                                name='pencil'
                                type='font-awesome'
                                color='#512DA8'
                                onPress={() => props.toggleModal()}
                                style = {styles.formItem}
                                />
                            </View> 
                    </Card>
                </Animatable.View>
            );
        }
        else {
            return(<View></View>);
        }
}

function RenderComments(props) {
    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating  imageSize = {20}  type = 'star' readonly style = {{ alignItems: 'flex-start' }} startingValue = {item.rating}/>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date.toLocaleString() } </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>        
            <Card title='Comments' >
                <FlatList 
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                    />
            </Card>
        </Animatable.View>
    );
}

class DishDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            favorites: [],
            showModal: false,
            rating: 5,
            author:'',
            comment:''
        };
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(dishId, rating, author, commentText) {
        if(rating && author && author != '' && commentText && commentText != '')
        {
            const {comments} = this.props.comments;
            var date = new Date();
            var tempComment = {
                id: (comments[comments.length - 1].id + 1),
                dishId: dishId,
                rating: rating,
                author: author,
                comment: commentText,
                date: date
            };
            comments.unshift(tempComment);
            this.setState({ comments: comments.slice(0)});
            this.props.postComment(dishId, rating, author, commentText);
            this.toggleModal();
        }
    }

    resetForm() {
        this.setState({
            showModal: false,
            rating: 5,
            author:'',
            comment:''
        });
    }
    
    ratingCompleted = (rating) => { 
        this.setState({rating : rating}); 
        console.log("Your Rating is: " + rating);
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId','');
        
        return(
            <ScrollView>
            <RenderDish dish={this.props.dishes.dishes[+dishId]}
               favorite={this.props.favorites.some(el => el === dishId)}
                onPress={() => this.markFavorite(dishId)} 
                toggleModal={() => this.toggleModal()} 
                />
            <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
            <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal() }
                    onRequestClose = {() => this.toggleModal() }>
                    <View style = {styles.modal}>
                        <Rating
                        type='star'
                        ratingCount={5}
                        imageSize={60}
                        showRating
                        onFinishRating={this.ratingCompleted}
                        startingValue={this.state.rating}
                        />
                        <Input
                        placeholder='Author'
                        onChangeText={author => this.setState({author})}
                        value={this.state.author}
                        leftIcon={
                            <Icon
                              type= 'font-awesome'
                              name='user-o'
                              iconStyle={ styles.inputIconStyle }
                            />
                          }
                        />
                        <Input
                        placeholder='Comment'
                        onChangeText={comment => this.setState({comment})}
                        value={this.state.comment}
                        leftIcon={
                          <Icon
                            type= 'font-awesome'
                            name='comment-o'
                            iconStyle={ styles.inputIconStyle }
                          />
                        }
                      />
                        <Button
                        onPress={() => this.handleComment(dishId, this.state.rating, this.state.author, this.state.comment)}
                        title="SUBMIT"
                        color="#512DA8"                        
                        accessibilityLabel="Learn more about this purple button"
                        style={ styles.modalButton }
                        />
                    </View> 
                    <View style = {styles.modal}>
                       <Button 
                           onPress = {() =>{this.toggleModal(); this.resetForm();}}
                           color="#ccc"
                           title="CANCEL" 
                           style={ styles.modalButton }
                           />
                   </View>
                </Modal>
        </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     },
     modalButton: {
         fontSize: 18,
         padding: 20
     },
     inputIconStyle:{
        marginRight: 10
     }
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);