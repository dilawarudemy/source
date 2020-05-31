var app = {

	init: function(){
		
		this.cacheDOM();
		this.setupAria();
		this.nextButton();
		this.prevButton();
		this.validateForm();
		this.startOver();
		this.editForm();
		this.killEnterKey();
		this.handleStepClicks();
		
		
		
	},

	cacheDOM: function(){
		if($(".interactive-form").size() === 0){ return; }console.log('here');
		this.$formParent = $(".interactive-form");
		this.$form = this.$formParent.find(".slideform-form");
		this.$formStepCtn = this.$formParent.find(".swiper-wrapper");
		this.$formStepParents = this.$form.find(".slideform-slide"),
		this.$message = this.$form.find('.contact__msg');
		
		this.$prevButton = this.$form.find(".btn-prev");
		this.$editButton = this.$form.find(".btn-edit");
		this.$resetButton = this.$form.find("[type='reset']");

		this.$stepsParent = $(".steps");
		this.$steps = this.$stepsParent.find("button");
	},

	htmlClasses: {
		activeClass: "active",
		hiddenClass: "hidden",
		visibleClass: "visible",
		editFormClass: "edit-form",
		animatedVisibleClass: "animated fadeIn",
		animatedHiddenClass: "animated fadeOut",
		animatingClass: "animating"
	},
	
	setFormHeight: function(activeStep) {console.log(activeStep);
		var activeStHeight = activeStep.outerHeight();console.log(activeStHeight);
		this.$formStepCtn.css('height', activeStHeight);
	},

	setupAria: function(){
		var pclass = this;
		/*
             * We need to add the continue buttons via Javascript, so we don't bloat
             * the html file with this type of content, only referred to our work.
             */
            this.$formStepParents.each( function (k, v) {
				
                // Setting the active slide.
                if ( k == 0 ) {var thisstep = $(this);  thisstep.addClass(app.htmlClasses.visibleClass);app.setFormHeight(thisstep);}

                if ( k < app.$formStepParents.length - 1 ) {
					if (!$(this).hasClass("singleinput"))
						$(this).find('.slideform-group').append('<button class="slideform-btn slideform-btn-next">Suivant</button>');
                } else if (k < app.$formStepParents.length ) {
                    $(this).find('.slideform-group p.politique').before('<button type="submit" class="slideform-btn slideform-btn-submit"><i class="icon-check"></i>&nbsp;&nbsp;Recevoir les rÃ©sultats</button>')
					
                }
            });
			
		
			
		this.$nextButton = this.$form.find(".slideform-btn-next");
		
		

		// set first parent to visible
		this.$formStepParents.eq(0).attr("aria-hidden",false);

		// set all other parents to hidden
		this.$formStepParents.not(":first").attr("aria-hidden",true);

		// handle aria-expanded on next/prev buttons
		app.handleAriaExpanded();

	},

	nextButton: function(){

		this.$nextButton.on("click", function(e){

			e.preventDefault();

			// grab current step and next step parent
			var $this = $(this),
					currentParent = $this.closest(".slideform-slide"),
					nextParent = currentParent.next();

					// if the form is valid hide current step
					// trigger next step
					if(app.checkForValidForm(currentParent)){
						currentParent.removeClass(app.htmlClasses.visibleClass);
						app.showNextStep(currentParent, nextParent);
					}

		});
	},

	prevButton: function(){

		this.$prevButton.on("click", function(e){

			e.preventDefault();

			// grab current step parent and previous parent
			var $this = $(this),
					currentParent = $(this).closest(".slideform-slide"),
					prevParent = currentParent.prev();

					// hide current step and show previous step
					// no need to validate form here
					currentParent.removeClass(app.htmlClasses.visibleClass);
					app.showPrevStep(currentParent, prevParent);

		});
	},

	showNextStep: function(currentParent,nextParent){
		var boxWidth = this.$formParent.width();
		// this.$formParent.stop();
		// hide previous parent
		currentParent
			// .addClass(app.htmlClasses.hiddenClass)
			.removeClass(app.htmlClasses.visibleClass)
			.attr("aria-hidden",true);

		// show next parent
		nextParent
			// .removeClass(app.htmlClasses.hiddenClass)
			.addClass(app.htmlClasses.visibleClass)
			.attr("aria-hidden",false);
			
		app.setFormHeight(nextParent);

		// focus first input on next parent
		nextParent.focus();

		// activate appropriate step
		app.handleState(nextParent.index());

		// handle aria-expanded on next/prev buttons
		app.handleAriaExpanded();

	},

	showPrevStep: function(currentParent,prevParent){

		// hide previous parent
		currentParent
			.addClass(app.htmlClasses.hiddenClass)
			.attr("aria-hidden",true);

		// show next parent
		prevParent
			.removeClass(app.htmlClasses.hiddenClass)
			.addClass(app.htmlClasses.visibleClass)
			.attr("aria-hidden",false);

		// send focus to first input on next parent
		prevParent.focus();

		// activate appropriate step
		app.handleState(prevParent.index());

		// handle aria-expanded on next/prev buttons
		app.handleAriaExpanded();

	},

	handleAriaExpanded: function(){

		/*
			Loop thru each next/prev button
			Check to see if the parent it conrols is visible
			Handle aria-expanded on buttons
		*/
		$.each(this.$nextButton, function(idx,item){
			var controls = $(item).attr("aria-controls");
			if($("#"+controls).attr("aria-hidden") == "true"){
				$(item).attr("aria-expanded",false);
			}else{
				$(item).attr("aria-expanded",true);
			}
		});

		$.each(this.$prevButton, function(idx,item){
			var controls = $(item).attr("aria-controls");
			if($("#"+controls).attr("aria-hidden") == "true"){
				$(item).attr("aria-expanded",false);
			}else{
				$(item).attr("aria-expanded",true);
			}
		});

	},
	done_func: function(response) {
		
		if(response.status == 'success') {
			app.$message.text(response.msg).fadeIn().removeClass('alert-danger').addClass('alert-success');
			// message.text(response.msg);
			// form.find('input:not([type="submit"]), textarea').val('');
			// console.log(response.eligible);
			if(response.eligible  == 1) {
				if( response.id != '' )
					setTimeout(function(){ app.$message.fadeOut(); window.location.href = 'remerciement.php?ui='+response.id; },2000);
			}
			else
				setTimeout(function(){ window.location.href = 'non-eligible.php?ui='+response.id; },2000);
		}
		else {
			app.$message.fadeIn().removeClass('alert-success').addClass('alert-danger');
			app.$message.text(response.msg).show();
			// hide the spinner
			$('form').removeAttr( 'data-submit-loading' );
			$('html, body').animate({
				scrollTop: $('form').offset().top
			}, 500);
			
			$('.slideform-btn-submit').attr("disabled", false);
		}
			return false;	
    },

    // fail function
    fail_func: function(data) {
        app.$message.fadeIn().removeClass('alert-success').addClass('alert-success');
        app.$message.text(data.msg);
        setTimeout(function () {
            app.$message.fadeOut();
			$('.slideform-btn-submit').attr("disabled", false);
        }, 2000);
    },
	validateForm: function(){
		// jquery validate form validation
		this.$form.validate({
			// ignore: ":hidden", // any children of hidden desc are ignored
			errorElement: "span", // wrap error elements in span not label
			// invalidHandler: function(event, validator){ // add aria-invalid to el with error
				// $.each(validator.errorList, function(idx,item){
					// if(idx === 0){
						// $(item.element).focus(); // send focus to first el with error
					// }
					// $(item.element).attr("aria-invalid",true); // add invalid aria
				// })
			// },
			rules: {
							codepostal: {
							  required: true,
							  number: true
							}
						},
                        messages: {
                            nom: {
                                required: 'Veuillez entrer votre nom'
                            },
							telephone: {
                                required: 'Ce champ est obligatoire',
								minlength: 'Veuillez entrer un tÃ©lÃ©phone valide'
                            },
							email: {
                                required: 'Veuillez entre votre adresse email',
								email:'Veuillez entrer un adresse email valide'
                            },
							codepostal: {
                                required: 'Veuillez entre votre code postal',
								 minlength: 'Veuillez entrer un code postal valide',
								 number:'Veuillez entrer un code postal valide'
                            }
                        },
			submitHandler: function(form) {
				// $form.trigger('goForward');
						var depts_eligible = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95];
						var cible_geo = 0;
						var zipcode = parseInt($('#zipcode').val().substring(0, 2));
						zipcode = Number(zipcode);
						var eligible = 0;
						if ($.inArray(zipcode, depts_eligible) >= 0) {
							eligible = 1;
							cible_geo = 1;
						}
						
						var form_data = app.$form.serialize() + '&eligible='+eligible + '&cible_geo=' + cible_geo;
						$.ajax({
							type: 'POST',
							url: 'submit.php',
							data: form_data,
							dataType: "json"
						})
						.done(app.done_func)
						.fail(app.fail_func);
		  }
		});
	},

	checkForValidForm: function(currentStep){
		if (!$.validator) return true;

            var valid = true;

            currentStep.find('input, textarea, select').each( function () {
                if ( !$(this).valid() ) valid = false;
            });

            return valid;
		// if(this.$form.valid()){
			// return true;
		// }
	},

	startOver: function(){

		var $parents = this.$formStepParents,
				$firstParent = this.$formStepParents.eq(0),
				$formParent = this.$formParent,
				$stepsParent = this.$stepsParent;

				this.$resetButton.on("click", function(e){

					// hide all parents - show first
					$parents
						.removeClass(app.htmlClasses.visibleClass)
						.addClass(app.htmlClasses.hiddenClass)
						.eq(0).removeClass(app.htmlClasses.hiddenClass)
						.eq(0).addClass(app.htmlClasses.visibleClass);

						// remove edit state if present
						$formParent.removeClass(app.htmlClasses.editFormClass);

						// manage state - set to first item
						app.handleState(0);

						// reset stage for initial aria state
						app.setupAria();

						// send focus to first item
						setTimeout(function(){
							$firstParent.focus();
						},200);

				}); // click

	},

	handleState: function(step){

		this.$steps.eq(step).prevAll().removeAttr("disabled");
		this.$steps.eq(step).addClass(app.htmlClasses.activeClass);

		// restart scenario
		if(step === 0){
			this.$steps
				.removeClass(app.htmlClasses.activeClass)
				.attr("disabled","disabled");
			this.$steps.eq(0).addClass(app.htmlClasses.activeClass)
		}

	},

	editForm: function(){
		var $formParent = this.$formParent,
				$formStepParents = this.$formStepParents,
				$stepsParent = this.$stepsParent;

				this.$editButton.on("click",function(){
					$formParent.toggleClass(app.htmlClasses.editFormClass);
					$formStepParents.attr("aria-hidden",false);
					$formStepParents.eq(0).find("input").eq(0).focus();
					app.handleAriaExpanded();
				});
	},

	killEnterKey: function(){
		$(document).on("keypress", ":input:not(textarea,button)", function(event) {
			return event.keyCode != 13;
		});
	},

	handleStepClicks: function(){
		
		this.$form.find('input[type=radio]').prev('label').on( 'click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			// Getting our element behind the span.
            var input = $(this).next('input[type=radio]');

            if ( (input.attr('type') != 'radio' || !input.is(':checked')) && !input.is(':disabled') ) {//alert(!input.is(':checked'));
				$(this).closest('.lp-input-group').addClass('selected');
                input.prop('checked', !input.is(':checked') ).change();
				var $this = $(this)
				setTimeout(function(){var currentParent = $this.closest(".slideform-slide"),
					nextParent = currentParent.next();

					// if the form is valid hide current step
					// trigger next step
					if(app.checkForValidForm(currentParent)){console.log('ffff');
						currentParent.removeClass(app.htmlClasses.visibleClass);
						app.showNextStep(currentParent, nextParent);
					}
				}, 200);
            }
		});

		var $stepTriggers = this.$steps,
				$stepParents = this.$formStepParents;

				$stepTriggers.on("click", function(e){

					e.preventDefault();

					var btnClickedIndex = $(this).index();

						// kill active state for items after step trigger
						$stepTriggers.nextAll()
							.removeClass(app.htmlClasses.activeClass)
							.attr("disabled",true);

						// activate button clicked
						$(this)
							.addClass(app.htmlClasses.activeClass)
							.attr("disabled",false)

						// hide all step parents
						$stepParents
							.removeClass(app.htmlClasses.visibleClass)
							.addClass(app.htmlClasses.hiddenClass)
							.attr("aria-hidden",true);

						// show step that matches index of button
						$stepParents.eq(btnClickedIndex)
							.removeClass(app.htmlClasses.hiddenClass)
							.addClass(app.htmlClasses.visibleClass)
							.attr("aria-hidden",false)
							.focus();

				});

	}

};

app.init();