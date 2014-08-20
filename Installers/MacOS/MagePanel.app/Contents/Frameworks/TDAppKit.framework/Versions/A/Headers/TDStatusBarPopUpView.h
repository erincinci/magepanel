//
//  TDStatusBarPopUpControl.h
//  TDAppKit
//
//  Created by Todd Ditchendorf on 11/16/12.
//  Copyright (c) 2012 Todd Ditchendorf. All rights reserved.
//

#import <TDAppKit/TDBar.h>

@interface TDStatusBarPopUpView : TDBar <NSMenuDelegate>  {
    NSString *labelText;
    NSString *valueText;
    NSButton *checkbox;
    NSPopUpButton *popUpButton;

    NSSize labelTextSize;
    NSSize valueTextSize;
    BOOL menuVisible;
}

+ (NSDictionary *)defaultLabelTextAttributes;
+ (NSDictionary *)defaultValueTextAttributes;
+ (NSDictionary *)defaultNonMainLabelTextAttributes;
+ (NSDictionary *)defaultNonMainValueTextAttributes;

- (NSRect)labelTextRectForBounds:(NSRect)bounds;
- (NSRect)valueTextRectForBounds:(NSRect)bounds;
- (NSRect)popUpButtonRectForBounds:(NSRect)bounds;
- (NSRect)arrowsRectForBounds:(NSRect)bounds;

- (void)updateValue;

@property (nonatomic, copy) NSString *labelText;
@property (nonatomic, copy) NSString *valueText;
@property (nonatomic, retain) IBOutlet NSButton *checkbox;
@property (nonatomic, retain) IBOutlet NSPopUpButton *popUpButton;
@end
