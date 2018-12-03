/*global MediumEditor, describe, it, expect, spyOn,
         afterEach, beforeEach, selectElementContents,
         jasmine, fireEvent*/

describe('Placeholder TestCase', function () {
    'use strict';

    beforeEach(function () {
        this.body = document.getElementsByTagName('body')[0];
        this.el = document.createElement('div');
        this.el.className = 'editor';
        this.el.innerHTML = '';
        this.body.appendChild(this.el);
    });

    afterEach(function () {
        var elements = document.querySelectorAll('.medium-editor-toolbar'),
            i,
            sel = window.getSelection();
        for (i = 0; i < elements.length; i += 1) {
            this.body.removeChild(elements[i]);
        }
        this.body.removeChild(this.el);
        sel.removeAllRanges();
    });

    it('should set placeholder for empty elements', function () {
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should not set a placeholder form elements with text content', function () {
        this.el.innerHTML = 'some text';
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should set placeholder for elements with empty children', function () {
        this.el.innerHTML = '<p><br></p><div class="empty"></div>';
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should remove the placeholder on keypress', function () {
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        fireEvent(editor.elements[0], 'keypress');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should add a placeholder to empty elements on blur', function () {
        this.el.innerHTML = 'some text';
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = '';
        fireEvent(editor.elements[0], 'blur');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
    });

    it('should not add a placeholder to elements with text on blur', function () {
        var editor = new MediumEditor('.editor');
        expect(editor.elements[0].className).toContain('medium-editor-placeholder');
        editor.elements[0].innerHTML = 'some text';
        fireEvent(editor.elements[0], 'blur');
        expect(editor.elements[0].className).not.toContain('medium-editor-placeholder');
    });

    it('should add the default placeholder text when data-placeholder is not present', function () {
        var editor = new MediumEditor('.editor'),
            placeholder = window.getComputedStyle(editor.elements[0], ':after').getPropertyValue('content');
        expect(placeholder).toEqual("'" + editor.options.placeholder + "'");
    });

    it('should use the data-placeholder when it is present', function () {
        this.el.setAttribute('data-placeholder', 'Custom placeholder');
        var editor = new MediumEditor('.editor'),
            placeholder = window.getComputedStyle(editor.elements[0], ':after').getPropertyValue('content');
        expect(placeholder).toEqual("'Custom placeholder'");
    });


});
