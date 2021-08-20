$(document).ready(function() {
  //add transition for slider
  $('.fieldset__slider-elem').toggleClass('fieldset__slider-elem_transition');
  $('.slider__thumb').toggleClass('slider__thumb_transition');

  /* ----- download cocktail photo ----- */
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();            
      reader.onload = function (e) {  
        $('#preview').attr('src', e.target.result);
        $('#fullImg').attr('src', e.target.result);
      }            
      reader.readAsDataURL(input.files[0]);
    }
  }    
  $('#download_photo').change(function(){
    readURL(this);
  });

  /* ----- slider ----- */
  // The slider moves one label at a time 
  //constructor
  function Slider(slider, sliderElem, thumb) {
    this.slider = slider;
    this.sliderElem = sliderElem;
    this.thumb = thumb;
    this.currLabel = 0;
    this.arrLabelSteps = [[0, 0]];
  }

  Slider.prototype.widthSliderVisibleLine;
  Slider.prototype.widthSliderZone;


  Slider.prototype.calcSharedProperties = function() {
    Slider.prototype.widthSliderVisibleLine = $('.fieldset__slider-elem').width();
    Slider.prototype.widthSliderZone = $('.slider__zone').width();
  }; // end calcSharedProperties

  Slider.prototype.initOwnProperties = function() {
    var arrLabelWidth = [];
    this.arrLabelSteps = [[0, 0]];

    $(this.sliderElem).find('label').each(function() {
      arrLabelWidth.push($(this).outerWidth());
    }); // end each

    var numberThumbPositions = 1;
    var sum = 0;
    for (var i = arrLabelWidth.length - 1; i >=0; i--) {
      sum += arrLabelWidth[i];
      if (sum > this.widthSliderVisibleLine + 10) {
        numberThumbPositions = i + 2;
        break;
      }
    }

    if (numberThumbPositions == 1) return;

    var thumbWidth = $(this.thumb).width();
    var stepSliderZone = (this.widthSliderZone - thumbWidth) / (numberThumbPositions - 1);

    var sumLabelWidth = 0;
    var currStep = 0;
    for (var i = 1; i < numberThumbPositions - 1; i++) {
      sumLabelWidth += arrLabelWidth[i-1];
      currStep += stepSliderZone;
      this.arrLabelSteps.push([-sumLabelWidth, currStep]);
    }
    sumLabelWidth += arrLabelWidth[numberThumbPositions - 2];
    this.arrLabelSteps.push([-sumLabelWidth, this.widthSliderZone - thumbWidth]);

    //set thumb and labels on its place relatively currLabel
    this.currLabel = 0;
    $(this.sliderElem).css('left', this.arrLabelSteps[this.currLabel][0] + 'px');
    $(this.thumb).css('left', this.arrLabelSteps[this.currLabel][1] + 'px');
  }; // end initOwnProperties

  var slidersArr = [];

  initSliders();

  //create an array of Slider objects
  function initSliders() {
    var slidersObj = $('.slider');
    var firstTime = true;

    for (var i = 0; i < slidersObj.length; i++) {
      var slider = slidersObj[i];
      var sliderElem = $(slider).prev().find('.fieldset__slider-elem')[0];
      var thumb = $(slider).find('.slider__thumb')[0];
      var newItem = new Slider(slider, sliderElem, thumb);
      if (firstTime) {
        newItem.calcSharedProperties();
        firstTime = false;
      }
      newItem.initOwnProperties();
      slidersArr.push(newItem);
    }
  }

  $(window).resize(function() {
    var widthSliderVisibleLine = $('.fieldset__slider-elem').width();
    if (widthSliderVisibleLine == slidersArr[0].widthSliderVisibleLine) return;

    slidersArr[0].calcSharedProperties();
    for (var i = 0; i < slidersArr.length; i++)
      slidersArr[i].initOwnProperties();

  }); // end resize

  /* ----- slider arrows ----- */
  $('.slider__nextArrow, .slider__prevArrow').on('click', onArrowClick);

  function onArrowClick(e) {
    var step;
    var $currSlider = $(this).closest('.slider')[0];
    var slider = findSlider($currSlider);

    if ($(this).hasClass('slider__prevArrow')) step = -1;
    else step = 1;

    var newCurrLabel = slider.currLabel + step;
    if (newCurrLabel < 0 || newCurrLabel >= slider.arrLabelSteps.length) return false;

    slider.currLabel += step;

    $(slider.sliderElem).css('left', slider.arrLabelSteps[slider.currLabel][0] + 'px');
    $(slider.thumb).css('left', slider.arrLabelSteps[slider.currLabel][1] + 'px');

    return false;
  }

  // drag&drop slider__thumb
  var sliderZone = $('.slider__zone');
  var sliderThumb = $('.slider__thumb');
  var sliderWrapper = $('.slider__wrapper');

  sliderWrapper.on('mousedown', onSliderWrapperMousedown);
  sliderWrapper.on('click', onSliderWrapperClick);
  sliderThumb.on('mousedown', onThumbMousedown);
  sliderThumb.on('click', onThumbClick);

  function findSlider($currSlider) {
    for (var i = 0; i < slidersArr.length; i++) {
      if (slidersArr[i].slider == $currSlider)
        return slidersArr[i];
    }
  }

  //if false, then we are moving a thumb now, if true, we are clicking on .slider__wrapper
  var mousedownFlag = false;

  function onSliderWrapperMousedown() {
    mousedownFlag = true;
  }

  function onSliderWrapperClick (e) {

    if (!mousedownFlag) return;
    var $currSlider = $(this).closest('.slider')[0];
    var slider = findSlider($currSlider);
    var xMousedown;

    //if we cannot move thumb
    if (slider.arrLabelSteps.length == 1) return false;

    //we can move thumb
    var sliderZoneCoords = sliderZone.offset();
    var xSliderZoneLeftEdge = sliderZoneCoords.left;
    xMousedown = e.pageX - xSliderZoneLeftEdge;

    var xCurrThumb = parseFloat($(slider.thumb).css('left'));

    if (xMousedown >= xCurrThumb) {
      if (slider.currLabel == slider.arrLabelSteps.length-1) return false;
      slider.currLabel++;
    } else {
      if (slider.currLabel == 0) return false;
      slider.currLabel--;
    }
    $(slider.thumb).css('left', slider.arrLabelSteps[slider.currLabel][1] + 'px');
    $(slider.sliderElem).css('left', slider.arrLabelSteps[slider.currLabel][0] + 'px');

    return false;
  }

  function onThumbClick(e) {
    e.stopPropagation();
  }

  function onThumbMousedown(e) {

    var $currSlider = $(this).closest('.slider')[0];
    var slider = findSlider($currSlider);

    e.stopPropagation();
    mousedownFlag = false;

    //if we cannot move thumb
    if (slider.arrLabelSteps.length == 1) return false;

    //we can move thumb
    //turn off transition
    toggleTransition();

    var sliderZoneCoords = sliderZone.offset();
    var xSliderZoneLeftEdge = sliderZoneCoords.left;
    var xSliderZoneRightEdge = slider.arrLabelSteps[slider.arrLabelSteps.length - 1][1];

    $('body').on('mousemove', onBodyMousemove);
    $('body').on('mouseup', onBodyMouseup);


    function toggleTransition() {
      $(slider.sliderElem).toggleClass('fieldset__slider-elem_transition');
      $(slider.thumb).toggleClass('slider__thumb_transition');
    }

    var arrLabelSteps = slider.arrLabelSteps;
    var lengthArrLabelSteps = arrLabelSteps.length;

    function onBodyMousemove(e) {
      var shiftX = e.pageX - xSliderZoneLeftEdge;
      var xCurrThumb, xCurrSliderElem;

      if (shiftX <= 0) {
        $(slider.thumb).css('left', 0 + 'px');
        $(slider.sliderElem).css('left', arrLabelSteps[0][0] + 'px');
      }
      else if (shiftX >= xSliderZoneRightEdge) {
        $(slider.thumb).css('left', arrLabelSteps[lengthArrLabelSteps - 1][1] + 'px');
        $(slider.sliderElem).css('left', arrLabelSteps[lengthArrLabelSteps - 1][0] + 'px');
      }
      else {
        xCurrThumb = shiftX;
        var thumbOneStep, sliderElemOneStep;

        for (var i = 0; i < lengthArrLabelSteps - 1; i++) {
          if (shiftX >= arrLabelSteps[i][1] && shiftX <= arrLabelSteps[i+1][1]) {
            thumbOneStep = arrLabelSteps[i+1][1] - arrLabelSteps[i][1];
            sliderElemOneStep = arrLabelSteps[i+1][0] - arrLabelSteps[i][0];
            shiftX -= arrLabelSteps[i][1];

            xCurrSliderElem = sliderElemOneStep * shiftX / thumbOneStep + arrLabelSteps[i][0];

            break;
          }
        }
      }

      $(slider.thumb).css('left', xCurrThumb + 'px');
      $(slider.sliderElem).css('left', xCurrSliderElem + 'px');
      
    }

    function onBodyMouseup(e) {

      var currLabel;
      var xCurrThumb = parseFloat($(slider.thumb).css('left'));

      for (var i = 0; i < lengthArrLabelSteps - 1; i++) {
        if (xCurrThumb >= arrLabelSteps[i][1] && xCurrThumb <= arrLabelSteps[i+1][1]) {
          if ((xCurrThumb - arrLabelSteps[i][1]) >= (arrLabelSteps[i+1][1] - xCurrThumb))
            currLabel = i + 1;
          else currLabel = i;
          break;
        }
      }

      slider.currLabel = currLabel;
      $(slider.thumb).css('left', slider.arrLabelSteps[slider.currLabel][1] + 'px');
      $(slider.sliderElem).css('left', slider.arrLabelSteps[slider.currLabel][0] + 'px');

      $('body').unbind();
      //turn on transition
      toggleTransition();
    }

    return false;
  }

  /* ----- button reset block ----- */
  function fixLabel(input, span, className) {
    if (input.is(':checked')) {
      if (!span.hasClass(className))
        span.toggleClass(className);
    } else {
      if (span.hasClass(className))
        span.toggleClass(className);
    }
  }
  /* ----- button reset ----- */
  $('button[type=reset]').click(function(event) {
    event.preventDefault();
    // close all opened lists
    $('.fieldset__list').each(function() {
      var $this = $(this);
      if ($this.hasClass('shown')) {
        $this.slideUp('normal');
        $this.toggleClass('shown');
      }
    }); // end each

    document.getElementById('form').reset();

    // reset all checkboxes and radio buttons
    $('.fieldset__list').each(function() {
      $(this).find('label').each(function() {
        var $this = $(this);
        var id = $this.prop('for');
        var $span = $this.find('span');
        var $input = $('input[id='+id+']');
        var typeInput = $input.prop('type');

        if (typeInput == 'radio') {
          fixLabel($input, $span, 'fieldset__radio_checked');
        } else { // checkbox
          fixLabel($input, $span, 'fieldset__checkbox_checked');
        }

      }); // end each label
    }); // end each .fieldset__list

    //reset photo
    $('#preview').attr('src', 'img/cocktail_photo.png');
    $('#fullImg').attr('src', 'img/cocktail_photo_full.png');

    //reset sliders
    for (var i = 0; i < slidersArr.length; i++) {
      slidersArr[i].currLabel = 0;
    }
    $('.slider__thumb').css('left', 0 + 'px');
    $('.fieldset__slider-elem').css('left', 0 + 'px');

  }); // end click reset

  /* -----  make checkbox and radio button checked in div.fieldset__list ----- */
  $('input[type=radio]').change(function(){
    var span = $('.fieldset__list [for='+this.id+'] span');
    if (span.length == 0) return;

    var list = $(span).closest('.fieldset__list');
    $(list).find('.fieldset__radio_checked').toggleClass('fieldset__radio_checked');
    span.toggleClass('fieldset__radio_checked');
  });

  $('input[type=checkbox]').change(function(){
    var span = $('.fieldset__list [for='+this.id+'] span');
    if (span.length == 0) return;

    span.toggleClass('fieldset__checkbox_checked');
  });

  /* ----- show list ----- */
  $('.fieldset__show-list').click(function(){
    var this_list = $(this).prev('.fieldset__list');           
      if (this_list.hasClass('shown')) {          
        this_list.slideUp('normal');              
      }
      else {                    
        this_list.slideDown('normal');            
      }
      this_list.toggleClass('shown');
  });

  function generateFieldsetList() {
    $('.slider').each(function(){
      var $this = $(this);
      var fieldsetList = $this.find('.fieldset__list');
      $this.prev('.gradient-border').find('input').each(function(){
        
        var $input = $(this);
        var checkedFlag = $input.is(':checked');
        var typeInput = $input.prop('type');
        var className;

        if (typeInput == 'radio')
          className = 'fieldset__radio_checked';
        else className = 'fieldset__checkbox_checked';

        var label = $input.next();
        var cloneLabel = label.clone();
        var labelText = label.text();
        var span = label.find('span');
        var cloneSpan = span.clone();

        if (checkedFlag) cloneSpan.toggleClass(className);
        cloneLabel.html(cloneSpan[0].outerHTML + labelText);
        cloneLabel.appendTo(fieldsetList);
      }); // end each input

    }); // end each .slider
  }

  //fill the .fieldset__list on base of .fieldset__slider-elem
  generateFieldsetList();

}); 